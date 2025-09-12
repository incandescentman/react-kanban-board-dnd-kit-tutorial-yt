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
    <div className="p-4 bg-gray-100 rounded-lg">
      <h4 className="font-bold mb-2">Data Management</h4>
      <div className="flex flex-wrap gap-2">
        <Button onClick={onExport} variant="outline" size="sm">Export JSON</Button>
        <Button onClick={handleImportClick} variant="outline" size="sm">Import JSON</Button>
        <Button onClick={onPublish} variant="outline" size="sm">Publish HTML</Button>
        {onPreview && (
          <Button onClick={onPreview} variant="outline" size="sm">Preview HTML</Button>
        )}
        {onPublishAll && (
          <Button onClick={onPublishAll} variant="outline" size="sm">Publish All HTML</Button>
        )}
        {onPreviewAll && (
          <Button onClick={onPreviewAll} variant="outline" size="sm">Preview All HTML</Button>
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
