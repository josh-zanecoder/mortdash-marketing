'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Layers } from 'lucide-react';
import { useEffect, useMemo, useRef } from 'react';
import grapesjs, { Editor } from 'grapesjs';
import presetWebpage from 'grapesjs-preset-webpage';

interface CampaignBuilderModalProps {
  open: boolean;
  onClose: () => void;
  campaignId: string | number | null;
}

export default function CampaignBuilderModal({
  open,
  onClose,
  campaignId,
}: CampaignBuilderModalProps) {
  const builderKey = useMemo(() => (campaignId ? `builder-${campaignId}` : 'builder'), [campaignId]);
  const editorContainerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<Editor | null>(null);
  const panelsRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open || !editorContainerRef.current || !panelsRef.current) return;

    const editor = grapesjs.init({
      container: editorContainerRef.current,
      height: '100%',
      width: '100%',
      showOffsets: true,
      noticeOnUnload: false,
      storageManager: false,
      fromElement: false,
      selectorManager: { componentFirst: true },
      blockManager: {
        appendTo: '#builder-blocks',
      },
      styleManager: {
        appendTo: '#builder-style-manager',
      },
      layerManager: {
        appendTo: '#builder-layers',
      },
      panels: {
        defaults: [],
      },
      plugins: [
        (editorInstance) =>
          presetWebpage(editorInstance, {
            modalImportTitle: 'Import HTML',
            modalImportLabel: 'Paste your HTML/CSS and replace the current content.',
            modalImportContent: '',
            textCleanCanvas: 'Are you sure you want to clear the canvas?',
            showStylesOnChange: true,
            useCustomTheme: true,
          }),
      ],
      pluginsOpts: {
        'grapesjs-preset-webpage': {
          blocks: ['link-block', 'quote', 'text-basic'],
          block: () => ({}),
        },
      },
    });

    // Move panels to custom container after plugin initialization
    const panels = editor.Panels;
    const panelsContainer = panelsRef.current;
    
    const movePanels = () => {
      if (!panelsContainer) return;
      
      panels.getPanels().each((panel: any) => {
        const panelId = panel.getId();
        const panelEl = panel.get('el');
        
        if (panelEl && !panelsContainer.querySelector(`#panel-wrapper-${panelId}`)) {
          const wrapper = document.createElement('div');
          wrapper.className = 'gjs-panel-wrapper flex items-center gap-1';
          wrapper.id = `panel-wrapper-${panelId}`;
          wrapper.appendChild(panelEl);
          panelsContainer.appendChild(wrapper);
        }
      });
    };
    
    // Wait for plugin to initialize panels
    editor.on('load', movePanels);
    setTimeout(movePanels, 100);
    
    // Toggle right sidebar visibility based on button state
    const updateSidebarVisibility = () => {
      const styleManagerEl = document.getElementById('builder-style-manager');
      const layersEl = document.getElementById('builder-layers');
      const viewsPanel = panels.getPanel('views');
      const openSmBtn = viewsPanel?.getButton('open-sm');
      const openLayersBtn = viewsPanel?.getButton('open-layers');
      
      const smActive = openSmBtn?.get('active');
      const layersActive = openLayersBtn?.get('active');
      
      if (styleManagerEl) {
        styleManagerEl.style.display = smActive ? 'block' : 'none';
      }
      if (layersEl) {
        layersEl.style.display = layersActive ? 'block' : 'none';
      }
    };
    
    editor.on('component:selected', updateSidebarVisibility);
    editor.on('change:canvas', updateSidebarVisibility);
    
    // Listen to button changes
    setTimeout(() => {
      const viewsPanel = panels.getPanel('views');
      if (viewsPanel) {
        viewsPanel.getButtons().each((btn: any) => {
          btn.on('change:active', updateSidebarVisibility);
        });
      }
      updateSidebarVisibility();
    }, 200);

    // Add initial content
    editor.addComponents(`
      <section style="padding:32px;text-align:center;background:#fff;">
        <h1 style="font-size:28px;margin-bottom:8px;">Start crafting your campaign</h1>
        <p style="color:#475569;">Drag blocks from the left to build your email.</p>
      </section>
    `);

    editorRef.current = editor;
    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
      if (panelsRef.current) {
        panelsRef.current.innerHTML = '';
      }
    };
  }, [open, builderKey]);

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        aria-describedby="campaign-builder-description"
        className="!max-w-[95vw] w-[95vw] !sm:max-w-6xl h-[90vh] p-0 rounded-3xl overflow-hidden flex flex-col"
      >
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-200 bg-white">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#ff6600]" />
                Campaign Builder
              </DialogTitle>
              <DialogDescription
                id="campaign-builder-description"
                className="text-sm text-slate-500"
              >
                Drag blocks, edit content, and preview your campaign. Saving and live HTML will be
                wired up next.
              </DialogDescription>
            </div>
            <div className="text-xs text-slate-500">
              Campaign ID:{' '}
              <span className="font-semibold text-slate-900">
                {campaignId ?? '—'}
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 bg-slate-50 flex flex-col overflow-hidden">
          {/* Panels Toolbar */}
          <div
            ref={panelsRef}
            className="flex flex-wrap items-center gap-2 bg-white border-b border-slate-200 px-2 py-1 overflow-x-auto"
          />

          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Left Sidebar - Blocks */}
            <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-200 bg-white p-4 flex flex-col space-y-3 overflow-hidden">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Blocks</p>
              <div
                id="builder-blocks"
                className="flex-1 overflow-auto"
              />
            </aside>

            {/* Main Editor Area */}
            <div className="flex-1 flex flex-col overflow-hidden" key={builderKey}>
              <div className="flex-1 bg-white overflow-hidden" ref={editorContainerRef} />
            </div>

            {/* Right Sidebar - Style Manager & Layers */}
            <div
              id="builder-style-manager"
              className="hidden md:block w-64 border-l border-slate-200 bg-white overflow-auto"
              style={{ display: 'none' }}
            />
            <div
              id="builder-layers"
              className="hidden md:block w-64 border-l border-slate-200 bg-white overflow-auto"
              style={{ display: 'none' }}
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 p-4 bg-white border-t border-slate-200">
            <Button variant="outline" className="rounded-full" onClick={onClose}>
              Close
            </Button>
            <Button disabled className="rounded-full bg-[#ff6600] text-white hover:bg-[#ff7a2f]">
              Save Draft
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

