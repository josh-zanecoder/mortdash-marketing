'use client';

import { useEffect, useRef, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useCampaignStore } from '@/store/campaignStore';
import { useEmailBuilderStore } from '@/store/useEmailBuilder';
import { useEmailTemplateStore } from '@/store/useEmailTemplateStore';
import SaveEmailTemplateModal from '@/components/SaveEmailTemplateModal';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';

function GrapesJSPageContent() {
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<any | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const searchParams = useSearchParams();
  const htmlFromUrl = searchParams.get('html');
  const builderId = searchParams.get('builderId');
  const campaignId = searchParams.get('campaignId');
  const templateId = searchParams.get('templateId');
  const token = searchParams.get('token');
  const [initialHtml, setInitialHtml] = useState<string | null>(null);
  const [htmlReady, setHtmlReady] = useState(false);
  const { saveCampaignTemplate } = useCampaignStore();
  const { saveTemplateHtml } = useEmailTemplateStore();
  const { openSaveModal } = useEmailBuilderStore();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Resolve initial HTML either from query string or from sessionStorage via builderId
  useEffect(() => {
    if (!isMounted) return;

    let resolvedHtml: string | null = null;

    if (htmlFromUrl) {
      try {
        resolvedHtml = decodeURIComponent(htmlFromUrl);
      } catch (error) {
        console.error('Failed to decode HTML from URL:', error);
      }
    }

    if (!resolvedHtml && builderId && typeof window !== 'undefined') {
      try {
        const storedHtml = window.sessionStorage.getItem(builderId);
        if (storedHtml) {
          resolvedHtml = storedHtml;
          window.sessionStorage.removeItem(builderId);
        }
      } catch (error) {
        console.error('Failed to read HTML from sessionStorage:', error);
      }
    }

    setInitialHtml(resolvedHtml);
    setHtmlReady(true);
  }, [isMounted, htmlFromUrl, builderId]);

  useEffect(() => {
    if (!isMounted || !htmlReady || !editorContainerRef.current) return;

    let editor: any = null;

    // Dynamically import GrapesJS only on client side
    Promise.all([
      import('grapesjs'),
      import('grapesjs-preset-newsletter')
    ]).then(([grapesjsModule, presetNewsletterModule]) => {
      const grapesjs = grapesjsModule.default;
      const presetNewsletter = presetNewsletterModule.default;

      if (!editorContainerRef.current) return;

      editor = grapesjs.init({
        height: '100vh',
        storageManager: false,
        container: editorContainerRef.current,
        fromElement: false,
        noticeOnUnload: false,
        plugins: [
          (editorInstance) =>
            presetNewsletter(editorInstance, {
              modalLabelImport: 'Paste all your code here below and click import',
              modalLabelExport: 'Copy the code and use it wherever you want',
              importPlaceholder: '<table class="table"><tr><td class="cell">Hello world!</td></tr></table>',
              cellStyle: {
                'font-size': '12px',
                'font-weight': '300',
                'vertical-align': 'top',
                color: 'rgb(111, 119, 125)',
                margin: '0',
                padding: '0',
              },
              inlineCss: true,
              updateStyleManager: true,
              showStylesOnChange: true,
              showBlocksOnLoad: true,
              useCustomTheme: true,
              textCleanCanvas: 'Are you sure you want to clear the canvas?',
            }),
        ],
      });

      // Add save to campaign command (if campaignId exists)
      if (campaignId && token) {
        editor.Commands.add('save-to-campaign', {
          run: async () => {
            const panels = editor.Panels;
            const saveButton = panels.getButton('options', 'save-to-campaign');
            const originalLabel = saveButton?.get('label') || '';
            
            try {
              setIsSaving(true);
              
              // Update button to show loading state
              if (saveButton) {
                saveButton.set('label', '<svg style="display: block; max-width: 22px" viewBox="0 0 24 24"><path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"><animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" from="0 12 12" to="360 12 12"/></path></svg>');
                saveButton.set('attributes', { title: 'Saving...', disabled: true });
              }
              
              // Get HTML from GrapesJS editor
              const html = editor.getHtml();
              const css = editor.getCss();
              
              // Combine HTML and CSS
              const fullHtml = `<style>${css}</style>${html}`;
              
              // Save to campaign
              await saveCampaignTemplate(token, campaignId, fullHtml);
              
              // Update button to show success state briefly
              if (saveButton) {
                saveButton.set('label', '<svg style="display: block; max-width: 22px" viewBox="0 0 24 24"><path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>');
                setTimeout(() => {
                  saveButton.set('label', originalLabel);
                  saveButton.set('attributes', { title: 'Save to Campaign', disabled: false });
                }, 2000);
              }
              
              toast.success('Template saved to campaign successfully!', {
                icon: <CheckCircle2 className="text-green-600" />,
                duration: 3000,
              });
            } catch (error: any) {
              // Restore button
              if (saveButton) {
                saveButton.set('label', originalLabel);
                saveButton.set('attributes', { title: 'Save to Campaign', disabled: false });
              }
              toast.error(error.message || 'Failed to save template');
            } finally {
              setIsSaving(false);
            }
          }
        });
      }

      // Add save to email template command (if templateId exists)
      if (templateId && token) {
        editor.Commands.add('save-to-template', {
          run: async () => {
            const panels = editor.Panels;
            const saveButton = panels.getButton('options', 'save-to-template');
            const originalLabel = saveButton?.get('label') || '';
            
            try {
              setIsSaving(true);
              
              // Update button to show loading state
              if (saveButton) {
                saveButton.set('label', '<svg style="display: block; max-width: 22px" viewBox="0 0 24 24"><path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"><animateTransform attributeName="transform" type="rotate" dur="1s" repeatCount="indefinite" from="0 12 12" to="360 12 12"/></path></svg>');
                saveButton.set('attributes', { title: 'Saving...', disabled: true });
              }
              
              // Get HTML from GrapesJS editor
              const html = editor.getHtml();
              const css = editor.getCss();
              
              // Combine HTML and CSS into final template
              const fullHtml = `<style>${css}</style>${html}`;
              
              // Replace the HTML template file and regenerate thumbnail - preserves all other template fields (name, subject, etc.)
              await saveTemplateHtml(token, templateId, fullHtml);
              
              // Update button to show success state briefly
              if (saveButton) {
                saveButton.set('label', '<svg style="display: block; max-width: 22px" viewBox="0 0 24 24"><path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>');
                setTimeout(() => {
                  saveButton.set('label', originalLabel);
                  saveButton.set('attributes', { title: 'Save to Template', disabled: false });
                }, 2000);
              }
              
              toast.success('Template HTML file and thumbnail updated successfully!', {
                icon: <CheckCircle2 className="text-green-600" />,
                duration: 3000,
              });
            } catch (error: any) {
              // Restore button
              if (saveButton) {
                saveButton.set('label', originalLabel);
                saveButton.set('attributes', { title: 'Save to Template', disabled: false });
              }
              toast.error(error.message || 'Failed to replace template file');
            } finally {
              setIsSaving(false);
            }
          }
        });
      }

      // Add save as email template command (always available)
      editor.Commands.add('save-as-template', {
        run: () => {
          try {
            // Get HTML from GrapesJS editor
            const html = editor.getHtml();
            const css = editor.getCss();
            
            // Combine HTML and CSS
            const fullHtml = `<style>${css}</style>${html}`;
            
            // Open save modal with HTML content
            if (token) {
              openSaveModal(fullHtml, token);
            } else {
              toast.error('Authentication token missing');
            }
          } catch (error: any) {
            toast.error('Failed to prepare template for saving');
            console.error('Error preparing template:', error);
          }
        }
      });

      // Add save to device command (always available)
      editor.Commands.add('save-to-device', {
        run: () => {
          try {
            // Get HTML from GrapesJS editor
            const html = editor.getHtml();
            const css = editor.getCss();
            
            // Combine HTML and CSS
            const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Template</title>
  <style>${css}</style>
</head>
<body>
${html}
</body>
</html>`;
            
            // Create blob and download
            const blob = new Blob([fullHtml], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `email-template-${new Date().getTime()}.html`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            
            toast.success('Template downloaded successfully!', {
              icon: <CheckCircle2 className="text-green-600" />,
              duration: 3000,
            });
          } catch (error: any) {
            toast.error('Failed to download template');
            console.error('Download error:', error);
          }
        }
      });

      // After editor is ready, either import HTML or add default content
      editor.onReady(() => {
        const panels = editor.Panels;
        
        // Ensure the options panel exists, create it if it doesn't
        let optionsPanel = panels.getPanel('options');
        if (!optionsPanel) {
          optionsPanel = panels.addPanel({
            id: 'options',
            visible: true,
          });
        }
        
        // Add save to device button (always available)
        panels.addButton('options', {
          id: 'save-to-device',
          label: '<svg style="display: block; max-width: 22px" viewBox="0 0 24 24"><path fill="currentColor" d="M5,20H19V18H5M19,11H15V17H9V11H5L12,4L19,11Z" /></svg>',
          command: 'save-to-device',
          attributes: { title: 'Save to Device' },
        });

        // Add save to campaign button (only if campaignId exists)
        if (campaignId && token) {
          panels.addButton('options', {
            id: 'save-to-campaign',
            label: '<svg style="display: block; max-width: 22px" viewBox="0 0 24 24"><path fill="currentColor" d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z" /></svg>',
            command: 'save-to-campaign',
            attributes: { title: 'Save to Campaign' },
          });
        }

        // Add save to email template button (only if templateId exists)
        if (templateId && token) {
          panels.addButton('options', {
            id: 'save-to-template',
            label: '<svg style="display: block; max-width: 22px" viewBox="0 0 24 24"><path fill="currentColor" d="M15,9H5V5H15M12,19A3,3 0 0,1 9,16A3,3 0 0,1 12,13A3,3 0 0,1 15,16A3,3 0 0,1 12,19M17,3H5C3.89,3 3,3.9 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V7L17,3Z" /></svg>',
            command: 'save-to-template',
            attributes: { title: 'Save to Template' },
          });
        }

        // Add save as email template button (always available)
        panels.addButton('options', {
          id: 'save-as-template',
          label: '<svg style="display: block; max-width: 22px" viewBox="0 0 24 24"><path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" /></svg>',
          command: 'save-as-template',
          attributes: { title: 'Save as Email Template' },
        });
        if (initialHtml) {
          try {
            // Clear canvas first
            editor.runCommand('core:canvas-clear');
            // Wait a bit then add the components
            setTimeout(() => {
              editor.addComponents(initialHtml);
            }, 300);
          } catch (error) {
            console.error('Failed to import initial HTML:', error);
            editor.addComponents(`
      <table class="main-body" style="width: 100%; height: 100vh; min-height: 100vh;">
        <tr class="row">
          <td class="main-body-cell" style="width: 100%; height: 100vh; vertical-align: middle; text-align: center;">
            <table class="container" style="width: 100%; max-width: 800px; margin: 0 auto;">
              <tr>
                <td class="container-cell" style="vertical-align: middle; padding: 40px 20px;">
                  <table class="card">
                    <tr>
                      <td class="card-cell">
                        <table class="table100 c1357">
                          <tr>
                            <td class="card-content" style="text-align: center; padding: 40px 20px;">
                              <h1 class="card-title" style="text-align: center; margin-bottom: 20px;">Build Your Own Email Campaign</h1>
                              <p class="card-text" style="text-align: center; margin-bottom: 15px;">Create professional email campaigns with our drag-and-drop builder. Design, customize, and send beautiful emails that engage your audience.</p>
                              <p class="card-text" style="text-align: center;">Drag blocks from the sidebar to start building your email template. Customize colors, fonts, and layouts to match your brand.</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <style>
        .link {
          color: rgb(217, 131, 166);
        }
        .row{
          vertical-align:top;
        }
        .main-body{
          min-height:150px;
          padding: 5px;
          width:100%;
          height:100%;
          background-color:rgb(234, 236, 237);
        }
        .c926{
          color:rgb(158, 83, 129);
          width:100%;
          font-size:50px;
        }
        .c1144{
          padding: 10px;
          font-size:17px;
          font-weight: 300;
        }
        .card{
          min-height:150px;
          padding: 5px;
          margin-bottom:20px;
          height:0px;
        }
        .card-cell{
          background-color:rgb(255, 255, 255);
          overflow:hidden;
          border-radius: 3px;
          padding: 0;
          text-align:center;
        }
        .c1271{
          width:100%;
          margin: 0 0 15px 0;
          font-size:50px;
          color:rgb(120, 197, 214);
          line-height:250px;
          text-align:center;
        }
        .table100{
          width:100%;
        }
        .c1357{
          min-height:150px;
          padding: 5px;
          margin: auto;
          height:0px;
        }
        .button{
          font-size:12px;
          padding: 10px 20px;
          background-color:rgb(217, 131, 166);
          color:rgb(255, 255, 255);
          text-align:center;
          border-radius: 3px;
          font-weight:300;
        }
        .card-title{
          font-size:25px;
          font-weight:300;
          color:rgb(68, 68, 68);
        }
        .card-content{
          font-size:13px;
          line-height:20px;
          color:rgb(111, 119, 125);
          padding: 10px 20px 0 20px;
          vertical-align:top;
        }
        .container{
          font-family: Helvetica, serif;
          min-height:150px;
          padding: 5px;
          margin:auto;
          height:0px;
          width:90%;
          max-width:550px;
        }
        .container-cell{
          vertical-align:top;
          font-size:medium;
          padding-bottom:50px;
        }
        .c1790{
          min-height:150px;
          padding: 5px;
          margin:auto;
          height:0px;
        }
        .table100.c1790{
          min-height:30px;
          border-collapse:separate;
          margin: 0 0 10px 0;
        }
        .browser-link{
          font-size:12px;
        }
        .top-cell{
          text-align:right;
          color:rgb(152, 156, 165);
        }
        .table100.c1357{
          margin: 0;
          border-collapse:collapse;
        }
        .c1769{
          width:30%;
        }
        .c1776{
          width:70%;
        }
        .c1766{
          margin: 0 auto 10px 0;
          padding: 5px;
          width:100%;
          min-height:30px;
        }
        .cell.c1769{
          width:11%;
        }
        .cell.c1776{
          vertical-align:middle;
        }
        .c1542{
          margin: 0 auto 10px auto;
          padding:5px;
          width:100%;
        }
        .card-footer{
          padding: 20px 0;
          text-align:center;
        }
      </style>
    `);
          }
        } else {
          // Add default initial content
          editor.addComponents(`
      <table class="main-body" style="width: 100%; height: 100vh; min-height: 100vh;">
        <tr class="row">
          <td class="main-body-cell" style="width: 100%; height: 100vh; vertical-align: middle; text-align: center;">
            <table class="container" style="width: 100%; max-width: 800px; margin: 0 auto;">
              <tr>
                <td class="container-cell" style="vertical-align: middle; padding: 40px 20px;">
                  <table class="card">
                    <tr>
                      <td class="card-cell">
                        <table class="table100 c1357">
                          <tr>
                            <td class="card-content" style="text-align: center; padding: 40px 20px;">
                              <h1 class="card-title" style="text-align: center; margin-bottom: 20px;">Build Your Own Email Campaign</h1>
                              <p class="card-text" style="text-align: center; margin-bottom: 15px;">Create professional email campaigns with our drag-and-drop builder. Design, customize, and send beautiful emails that engage your audience.</p>
                              <p class="card-text" style="text-align: center;">Drag blocks from the sidebar to start building your email template. Customize colors, fonts, and layouts to match your brand.</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
      <style>
        .link {
          color: rgb(217, 131, 166);
        }
        .row{
          vertical-align:top;
        }
        .main-body{
          min-height:150px;
          padding: 5px;
          width:100%;
          height:100%;
          background-color:rgb(234, 236, 237);
        }
        .c926{
          color:rgb(158, 83, 129);
          width:100%;
          font-size:50px;
        }
        .c1144{
          padding: 10px;
          font-size:17px;
          font-weight: 300;
        }
        .card{
          min-height:150px;
          padding: 5px;
          margin-bottom:20px;
          height:0px;
        }
        .card-cell{
          background-color:rgb(255, 255, 255);
          overflow:hidden;
          border-radius: 3px;
          padding: 0;
          text-align:center;
        }
        .c1271{
          width:100%;
          margin: 0 0 15px 0;
          font-size:50px;
          color:rgb(120, 197, 214);
          line-height:250px;
          text-align:center;
        }
        .table100{
          width:100%;
        }
        .c1357{
          min-height:150px;
          padding: 5px;
          margin: auto;
          height:0px;
        }
        .button{
          font-size:12px;
          padding: 10px 20px;
          background-color:rgb(217, 131, 166);
          color:rgb(255, 255, 255);
          text-align:center;
          border-radius: 3px;
          font-weight:300;
        }
        .card-title{
          font-size:25px;
          font-weight:300;
          color:rgb(68, 68, 68);
        }
        .card-content{
          font-size:13px;
          line-height:20px;
          color:rgb(111, 119, 125);
          padding: 10px 20px 0 20px;
          vertical-align:top;
        }
        .container{
          font-family: Helvetica, serif;
          min-height:150px;
          padding: 5px;
          margin:auto;
          height:0px;
          width:90%;
          max-width:550px;
        }
        .container-cell{
          vertical-align:top;
          font-size:medium;
          padding-bottom:50px;
        }
        .c1790{
          min-height:150px;
          padding: 5px;
          margin:auto;
          height:0px;
        }
        .table100.c1790{
          min-height:30px;
          border-collapse:separate;
          margin: 0 0 10px 0;
        }
        .browser-link{
          font-size:12px;
        }
        .top-cell{
          text-align:right;
          color:rgb(152, 156, 165);
        }
        .table100.c1357{
          margin: 0;
          border-collapse:collapse;
        }
        .c1769{
          width:30%;
        }
        .c1776{
          width:70%;
        }
        .c1766{
          margin: 0 auto 10px 0;
          padding: 5px;
          width:100%;
          min-height:30px;
        }
        .cell.c1769{
          width:11%;
        }
        .cell.c1776{
          vertical-align:middle;
        }
        .c1542{
          margin: 0 auto 10px auto;
          padding:5px;
          width:100%;
        }
        .card-footer{
          padding: 20px 0;
          text-align:center;
        }
      </style>
    `);
        }
      });

      editorRef.current = editor;
    }).catch((error) => {
      console.error('Failed to load GrapesJS:', error);
    });

    // Cleanup function
    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, [isMounted, htmlReady, initialHtml, campaignId, templateId, token, saveCampaignTemplate, saveTemplateHtml, openSaveModal]);

  if (!isMounted) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <Loader2 className="w-8 h-8 text-[#ff6600] animate-spin" />
        <p className="text-gray-600 text-sm">Loading email builder...</p>
      </div>
    );
  }

  if (!htmlReady) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <Loader2 className="w-8 h-8 text-[#ff6600] animate-spin" />
        <p className="text-gray-600 text-sm">Loading template content...</p>
      </div>
    );
  }

  const handleSave = async () => {
    if (!editorRef.current || !campaignId || !token) {
      toast.error('Missing required information to save');
      return;
    }

    try {
      setIsSaving(true);
      
      // Get HTML from GrapesJS editor
      const html = editorRef.current.getHtml();
      const css = editorRef.current.getCss();
      
      // Combine HTML and CSS
      const fullHtml = `<style>${css}</style>${html}`;
      
      // Save to campaign
      await saveCampaignTemplate(token, campaignId, fullHtml);
      
      toast.success('Template saved successfully!');
      
      // Optionally navigate back to campaigns page
      // router.push(`/marketing/new-campaign?token=${encodeURIComponent(token)}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Toaster />
      <div style={{ height: '100vh', margin: 0, overflow: 'hidden', position: 'relative' }}>
        {/* Loading overlay */}
        {isSaving && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            gap: '16px'
          }}>
            <Loader2 className="w-8 h-8 text-white animate-spin" />
            <p className="text-white font-medium">Saving template...</p>
          </div>
        )}
        <div
          ref={editorContainerRef}
          style={{ height: '100vh', overflow: 'hidden' }}
        />
      </div>
      <SaveEmailTemplateModal />
    </>
  );
}

export default function GrapesJSPage() {
  return (
    <Suspense fallback={
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
        <Loader2 className="w-8 h-8 text-[#ff6600] animate-spin" />
        <p className="text-gray-600 text-sm">Loading email builder...</p>
      </div>
    }>
      <GrapesJSPageContent />
    </Suspense>
  );
}

