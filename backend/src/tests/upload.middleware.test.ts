import { Request } from 'express';
import { uploadMiddleware } from '../middleware/upload.middleware';

const mockFile = (mimetype: string): Express.Multer.File =>
  ({ mimetype } as Express.Multer.File);

const runFileFilter = (
  mimetype: string,
): Promise<{ error: Error | null; accept: boolean }> =>
  new Promise((resolve) => {
    const filter = (uploadMiddleware as any).fileFilter as (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, acceptFile: boolean) => void,
    ) => void;
    filter({} as Request, mockFile(mimetype), (error, accept) =>
      resolve({ error, accept }),
    );
  });

describe('upload.middleware fileFilter', () => {
  it('accepts application/pdf', async () => {
    const result = await runFileFilter('application/pdf');
    expect(result.error).toBeNull();
    expect(result.accept).toBe(true);
  });

  it('accepts DOCX MIME type', async () => {
    const result = await runFileFilter(
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    expect(result.error).toBeNull();
    expect(result.accept).toBe(true);
  });

  it('rejects other MIME types with an error', async () => {
    const result = await runFileFilter('image/png');
    expect(result.error).toBeInstanceOf(Error);
  });
});
