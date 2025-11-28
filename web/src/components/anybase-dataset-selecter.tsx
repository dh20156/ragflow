'use client';

import { useTranslation } from 'react-i18next';
import { useParams } from 'umi';
import { ButtonLoading } from './ui/button';

export function AnybaseDatasetSelecter() {
  const { t } = useTranslation();
  const { id } = useParams();

  const handleClick = () => {
    const baseUrl = window.location.protocol + '//' + window.location.hostname;
    const origin =
      process.env.NODE_ENV === 'development'
        ? `${baseUrl}:8000`
        : window.location.origin;
    window.parent.postMessage(
      {
        type: 'OPEN_ANYBASE_DATASET_SELECTOR',
        source: 'RagFlow',
        payload: {
          kb_id: id as string,
        },
      },
      origin,
    );
  };

  return (
    <div className="relative -top-1">
      <ButtonLoading size="sm" onClick={() => handleClick()}>
        {t('fileManager.choose')}
      </ButtonLoading>
    </div>
  );
}
