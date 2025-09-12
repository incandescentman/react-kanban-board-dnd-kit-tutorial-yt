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
}

function DataManagement({ onExport, onImport, onPublish, onPreview, onPublishAll, onPreviewAll }: Props) {
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
