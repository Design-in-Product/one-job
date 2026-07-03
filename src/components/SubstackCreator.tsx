
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SubstackCreatorProps {
  onCreateSubstack: (name: string) => void;
}

const SubstackCreator: React.FC<SubstackCreatorProps> = ({ onCreateSubstack }) => {
  const { t } = useTranslation();
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
        {t('substack.create')}
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <Label htmlFor="substackName">{t('substack.nameLabel')}</Label>
        <Input
          id="substackName"
          value={substackName}
          onChange={(e) => setSubstackName(e.target.value)}
          placeholder={t('substack.namePlaceholder')}
          autoFocus
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={!substackName.trim()}>
          {t('substack.confirm')}
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
