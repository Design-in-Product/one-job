
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

interface SubstackCreatorProps {
  onCreateSubstack: (name: string) => void;
}

const SubstackCreator: React.FC<SubstackCreatorProps> = ({ onCreateSubstack }) => {
  const [substackName, setSubstackName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (substackName.trim()) {
      onCreateSubstack(substackName.trim());
      setSubstackName('');
      setIsCreating(false);
    }
  };

  if (!isCreating) {
    return (
      <Button 
        onClick={() => setIsCreating(true)}
        variant="outline"
        className="w-full"
      >
        <Plus className="w-4 h-4 mr-2" />
        Create Substack
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label htmlFor="substackName">Substack Name</Label>
        <Input
          id="substackName"
          value={substackName}
          onChange={(e) => setSubstackName(e.target.value)}
          placeholder="Enter substack name..."
          autoFocus
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={!substackName.trim()}>
          Create
        </Button>
        <Button 
          type="button" 
          variant="outline"
          onClick={() => {
            setIsCreating(false);
            setSubstackName('');
          }}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default SubstackCreator;
