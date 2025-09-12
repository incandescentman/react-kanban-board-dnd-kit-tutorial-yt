import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Download, Upload, Globe, Eye, Rocket, Layers } from 'lucide-react';

interface Props {
  onExport: () => void;
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onPublish: () => void;
  onPreview?: () => void;
  onPublishAll?: () => void;
  onPreviewAll?: () => void;
  onSyncFromStorage?: () => void;
}

function DataManagement({ onExport, onImport, onPublish, onPreview, onPublishAll, onPreviewAll, onSyncFromStorage }: Props) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-72 bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-2xl pl-4 pr-2 py-4 shadow-lg">
      {/* Header (match mini panel style) */}
      <div className="mb-3 pb-2 border-b border-blue-200">
        <h3 className="text-lg font-bold text-blue-900 text-center">Data Management</h3>
      </div>
      <div className="grid grid-cols-3 gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="group relative inline-block">
              <Button onClick={onExport} variant="outline" size="icon" className="h-8 w-8 rounded-full border-blue-200 bg-white text-blue-700 hover:bg-blue-50">
                <Download className="h-4 w-4" />
              </Button>
              <TooltipContent side="top">Export</TooltipContent>
            </div>
          </TooltipTrigger>
        </Tooltip>

        {onSyncFromStorage && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="group relative inline-block">
                <Button onClick={onSyncFromStorage} variant="outline" size="icon" className="h-8 w-8 rounded-full border-blue-200 bg-white text-blue-700 hover:bg-blue-50">
                  {/* refresh icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M21 12a9 9 0 1 1-6.219-8.56"/><path d="M21 3v6h-6"/></svg>
                </Button>
                <TooltipContent side="top">Sync from storage</TooltipContent>
              </div>
            </TooltipTrigger>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="group relative inline-block">
              <Button onClick={handleImportClick} variant="outline" size="icon" className="h-8 w-8 rounded-full border-blue-200 bg-white text-blue-700 hover:bg-blue-50">
                <Upload className="h-4 w-4" />
              </Button>
              <TooltipContent side="top">Import</TooltipContent>
            </div>
          </TooltipTrigger>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="group relative inline-block">
              <Button onClick={onPublish} variant="outline" size="icon" className="h-8 w-8 rounded-full border-blue-200 bg-white text-blue-700 hover:bg-blue-50">
                <Rocket className="h-4 w-4" />
              </Button>
              <TooltipContent side="top">Publish</TooltipContent>
            </div>
          </TooltipTrigger>
        </Tooltip>

        {onPreview && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="group relative inline-block">
              <Button onClick={onPreview} variant="outline" size="icon" className="h-8 w-8 rounded-full border-blue-200 bg-white text-blue-700 hover:bg-blue-50">
                <Eye className="h-4 w-4" />
              </Button>
                <TooltipContent side="top">Preview</TooltipContent>
              </div>
            </TooltipTrigger>
          </Tooltip>
        )}

        {onPublishAll && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="group relative inline-block">
              <Button onClick={onPublishAll} variant="outline" size="icon" className="h-8 w-8 rounded-full border-blue-200 bg-white text-blue-700 hover:bg-blue-50">
                <Globe className="h-4 w-4" />
              </Button>
                <TooltipContent side="top">Publish All</TooltipContent>
              </div>
            </TooltipTrigger>
          </Tooltip>
        )}

        {onPreviewAll && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="group relative inline-block">
                <Button onClick={onPreviewAll} variant="outline" size="icon" className="h-8 w-8 rounded-full border-blue-200 bg-white text-blue-700 hover:bg-blue-50">
                  <Layers className="h-4 w-4" />
                </Button>
                <TooltipContent side="top">Preview All</TooltipContent>
              </div>
            </TooltipTrigger>
          </Tooltip>
        )}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".json"
          onChange={onImport}
        />
      </div>
    </div>
  );
}

export default DataManagement;
