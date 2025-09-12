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
    <div className="w-72 bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-2xl p-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🗂️</span>
        <h4 className="text-base font-bold text-blue-900">Data Management</h4>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onExport} variant="outline" size="icon" className="h-9 w-9 rounded-full border-blue-200 bg-white text-blue-700 hover:bg-blue-50">
              <Download className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Export</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={handleImportClick} variant="outline" size="icon" className="h-9 w-9 rounded-full border-blue-200 bg-white text-blue-700 hover:bg-blue-50">
              <Upload className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Import</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={onPublish} variant="outline" size="icon" className="h-9 w-9 rounded-full border-blue-200 bg-white text-blue-700 hover:bg-blue-50">
              <Rocket className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">Publish</TooltipContent>
        </Tooltip>

        {onPreview && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={onPreview} variant="outline" size="icon" className="h-9 w-9 rounded-full border-blue-200 bg-white text-blue-700 hover:bg-blue-50">
                <Eye className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Preview</TooltipContent>
          </Tooltip>
        )}

        {onPublishAll && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={onPublishAll} variant="outline" size="icon" className="h-9 w-9 rounded-full border-blue-200 bg-white text-blue-700 hover:bg-blue-50">
                <Globe className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Publish All</TooltipContent>
          </Tooltip>
        )}

        {onPreviewAll && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button onClick={onPreviewAll} variant="outline" size="icon" className="h-9 w-9 rounded-full border-blue-200 bg-white text-blue-700 hover:bg-blue-50">
                <Layers className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Preview All</TooltipContent>
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
