import React from 'react';
import { Button } from '@/components/ui/button';

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
    <div className="w-64 bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 rounded-2xl p-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🗂️</span>
        <h4 className="text-base font-bold text-blue-900">Data Management</h4>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button onClick={onExport} variant="outline" size="sm" className="border-blue-200 w-full justify-center">Export</Button>
        <Button onClick={handleImportClick} variant="outline" size="sm" className="border-blue-200 w-full justify-center">Import</Button>
        <Button onClick={onPublish} variant="outline" size="sm" className="border-blue-200 w-full justify-center">Publish</Button>
        {onPreview && (
          <Button onClick={onPreview} variant="outline" size="sm" className="border-blue-200 w-full justify-center">Preview</Button>
        )}
        {onPublishAll && (
          <Button onClick={onPublishAll} variant="outline" size="sm" className="border-blue-200 w-full justify-center">Publish All</Button>
        )}
        {onPreviewAll && (
          <Button onClick={onPreviewAll} variant="outline" size="sm" className="border-blue-200 w-full justify-center">Preview All</Button>
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
