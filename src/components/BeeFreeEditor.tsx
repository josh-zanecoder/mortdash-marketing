'use client';

import { useEffect, useRef, useState } from 'react';
import BeefreeSDK from '@beefree.io/sdk';
import { toast } from 'sonner';
import { CheckCircle2, XCircle } from 'lucide-react';
import SaveTemplateModal from './SaveTemplateModal';

interface TemplateData {
  html: string;
  json: string;
  ampHtml: string | null;
  version: number;
  language: string | null;
}

export default function BeefreeEditor() {
  // Create a reference to the DOM element where the editor will be mounted
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [templateData, setTemplateData] = useState<TemplateData | null>(null);

  // Initialize the editor once when the component mounts
  useEffect(() => {
    async function initializeEditor() {
      // Beefree SDK configuration object
      // container: (required) The ID of the DOM element where the editor will be mounted
      // language: (optional) The language for the editor UI
      // onSave: Callback when user saves - returns both JSON structure and HTML output
      // onError: Callback for handling errors like token expiration
      const beeConfig = {
        container: 'beefree-react-demo',
        language: 'en-US',
        onSave: (pageJson: string, pageHtml: string, ampHtml: string | null, templateVersion: number, language: string | null) => {
          // Store the template data and show the modal
          setTemplateData({
            html: pageHtml,
            json: pageJson,
            ampHtml,
            version: templateVersion,
            language
          });
          setShowSaveModal(true);
        },
        onError: (error: unknown) => {
          console.error('Error:', error);
          toast.error('Editor error occurred', {
            icon: <XCircle className="text-red-600" />,
          });
        }
      };

      try {
        // Get authentication token from the Next.js API route
        const token = await fetch('/api/proxy/bee-auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: 'demo-user' })
        }).then(res => res.json());

        // Initialize the Beefree SDK with the authentication token
        const bee = new BeefreeSDK(token);
        // Start the editor with our configuration
        bee.start(beeConfig, {});
      } catch (error) {
        console.error('Failed to initialize Beefree editor:', error);
        toast.error('Failed to initialize editor', {
          icon: <XCircle className="text-red-600" />,
        });
      }
    }

    initializeEditor();
  }, []); // Empty dependency array ensures this only runs once on mount

  const handleSaveTemplate = async (templateData: {
    name: string;
    file: string;
    templateType: string;
    subject: string;
    html: string;
    json: string;
    ampHtml: string | null;
    version: number;
    language: string | null;
    email_template_id?: number;
  }) => {
    setIsSaving(true);
    try {
      // Create FormData to match the jQuery implementation
      const formData = new FormData();
      
      // Add form fields
      formData.append('name', templateData.name);
      formData.append('subject', templateData.subject);
      
      // Get the audience type ID based on the selected template type
      const audienceTypeId = await getAudienceTypeId(templateData.templateType);
      formData.append('audience_type_id', audienceTypeId.toString());
      
      formData.append('created_at', new Date().toISOString());
      
      // Add email_template_id if provided (for updates)
      if (templateData.email_template_id) {
        formData.append('email_template_id', templateData.email_template_id.toString());
      }
      
      // Create a file from the HTML content
      const htmlBlob = new Blob([templateData.html], { type: 'text/html' });
      const htmlFile = new File([htmlBlob], 'template.html', { type: 'text/html' });
      formData.append('file', htmlFile);
      
      // Save the template to your database
      const response = await fetch('/api/email-templates', {
        method: 'POST',
        body: formData, // Send as FormData instead of JSON
      });

      if (!response.ok) {
        throw new Error('Failed to save template');
      }

      const result = await response.json();
      
      toast.success('Email template saved successfully!', {
        icon: <CheckCircle2 className="text-green-600" />,
      });
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save email template', {
        icon: <XCircle className="text-red-600" />,
      });
      throw error; // Re-throw to let the modal handle it
    } finally {
      setIsSaving(false);
    }
  };

  // Helper function to get audience type ID from template type value
  const getAudienceTypeId = async (templateTypeValue: string): Promise<number> => {
    try {
      const response = await fetch('/api/audience_types');
      if (!response.ok) {
        throw new Error('Failed to fetch audience types');
      }
      const data = await response.json();
      
      // Helper function to create normalized value from name (same as SaveTemplateModal)
      const createValueFromName = (name: string): string => {
        return name.toLowerCase().replace(/\s+/g, '_');
      };
      
      if (data.success && Array.isArray(data.data)) {
        // Add value field to each audience type and find the match
        const audienceType = data.data.find((at: any) => {
          const normalizedValue = createValueFromName(at.name);
          return normalizedValue === templateTypeValue;
        });
        
        if (audienceType) {
          return audienceType.id;
        }
      } else if (Array.isArray(data)) {
        // Add value field to each audience type and find the match
        const audienceType = data.find((at: any) => {
          const normalizedValue = createValueFromName(at.name);
          return normalizedValue === templateTypeValue;
        });
        
        if (audienceType) {
          return audienceType.id;
        }
      }
      
      return 1;
    } catch (error) {
      console.error('Error getting audience type ID:', error);
      // Fallback to ID 1 if error
      return 1;
    }
  };

  // Render the container div where Beefree SDK will mount the editor
  return (
    <div className="w-full">
      {isSaving && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-700">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></div>
            <span>Saving template...</span>
          </div>
        </div>
      )}
      <div
        id="beefree-react-demo"
        ref={containerRef}
        className="w-full h-[500px] md:h-[600px] lg:h-[700px] border border-gray-300 rounded-lg shadow-sm"
        style={{
          minHeight: '500px',
          maxHeight: '800px'
        }}
      />
      
      {templateData && (
        <SaveTemplateModal
          open={showSaveModal}
          onClose={() => {
            setShowSaveModal(false);
            setTemplateData(null);
          }}
          onSave={handleSaveTemplate}
          html={templateData.html}
          json={templateData.json}
          ampHtml={templateData.ampHtml}
          version={templateData.version}
          language={templateData.language}
          email_template_id={undefined} // Pass undefined for new templates, or actual ID for updates
        />
      )}
    </div>
  );
}
