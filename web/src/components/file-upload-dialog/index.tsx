import { ButtonLoading } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IModalProps } from '@/interfaces/common';
import { zodResolver } from '@hookform/resolvers/zod';
import { TFunction } from 'i18next';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { AnybaseDatasetSelecter } from '../anybase-dataset-selecter';
import { AnybaseFormItem } from '../anybase-form';
import { FileUploader } from '../file-uploader';
import { RAGFlowFormItem } from '../ragflow-form';
import { Form } from '../ui/form';
import { Switch } from '../ui/switch';
import { useCallback, useEffect } from 'react';

function buildUploadFormSchema(t: TFunction) {
  const FormSchema = z.object({
    parseOnCreation: z.boolean().optional(),
    fileList: z
      .array(z.instanceof(File))
      .min(1, { message: t('fileManager.pleaseUploadAtLeastOneFile') }),
  });

  return FormSchema;
}

export type UploadFormSchemaType = z.infer<
  ReturnType<typeof buildUploadFormSchema>
>;

const UploadFormId = 'UploadFormId';

type UploadFormProps = {
  submit: (values?: UploadFormSchemaType) => void;
  showParseOnCreation?: boolean;
};
function UploadForm({ submit, showParseOnCreation }: UploadFormProps) {
  const { t } = useTranslation();
  const FormSchema = buildUploadFormSchema(t);

  type UploadFormSchemaType = z.infer<typeof FormSchema>;
  const form = useForm<UploadFormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      parseOnCreation: false,
      fileList: [],
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submit)}
        id={UploadFormId}
        className="space-y-4"
      >
        {showParseOnCreation && (
          <RAGFlowFormItem
            name="parseOnCreation"
            label={t('fileManager.parseOnCreation')}
          >
            {(field) => (
              <Switch
                onCheckedChange={field.onChange}
                checked={field.value}
              ></Switch>
            )}
          </RAGFlowFormItem>
        )}
        <RAGFlowFormItem name="fileList" label={t('fileManager.file')}>
          {(field) => (
            <FileUploader
              value={field.value}
              onValueChange={field.onChange}
              accept={{ '*': [] }}
            />
          )}
        </RAGFlowFormItem>
      </form>
    </Form>
  );
}

function AnybaseForm({ submit }: UploadFormProps) {
  const { t } = useTranslation();
  const FormSchema = buildUploadFormSchema(t);
  const form = useForm<UploadFormSchemaType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      parseOnCreation: false,
      fileList: [],
    },
  });
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(submit)}
        id={UploadFormId}
        className="space-y-4"
      >
        <AnybaseFormItem
          name="parseOnCreation"
          label={t('fileManager.chooseDatasetFiles')}
          horizontal
        >
          {() => <AnybaseDatasetSelecter />}
        </AnybaseFormItem>
      </form>
    </Form>
  );
}

type FileUploadDialogProps = IModalProps<UploadFormSchemaType> &
  Pick<UploadFormProps, 'showParseOnCreation'>;
export function FileUploadDialog({
  hideModal,
  onOk,
  loading,
  showParseOnCreation = false,
}: FileUploadDialogProps) {
  const { t } = useTranslation();

  /** —————————————————— AnyBase Start —————————————————— */

  // 处理来自Anybase的消息
  const handleMessage = useCallback((event: MessageEvent) => {
    // 验证消息来源（即使同源也建议验证）
    if (!event.origin.startsWith(window.location.origin) && process.env.NODE_ENV !== "development") {
      return;
    }

    const { type, payload, source } = event.data;

    if (source !== 'Anybase') return;

    switch (type) {
      /** 登录成功 */
      case 'FILES_UPLOAD_COMPLETE':
        if(payload)
          window.location.reload()
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  /** —————————————————— AnyBase End —————————————————— */

  return (
    <Dialog open onOpenChange={hideModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('fileManager.uploadFile')}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="account">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="account">{t('fileManager.local')}</TabsTrigger>
            {/* <TabsTrigger value="password">{t('fileManager.s3')}</TabsTrigger> */}
            <TabsTrigger value="password">
              {t('fileManager.anybase')}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <UploadForm
              submit={onOk!}
              showParseOnCreation={showParseOnCreation}
            ></UploadForm>
          </TabsContent>
          <TabsContent value="password">
            <AnybaseForm submit={onOk!}></AnybaseForm>
          </TabsContent>
          {/* <TabsContent value="password">{t('common.comingSoon')}</TabsContent> */}
          <TabsContent value="account">
        <DialogFooter>
              <ButtonLoading
                type="submit"
                loading={loading}
                form={UploadFormId}
              >
            {t('common.save')}
          </ButtonLoading>
        </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}