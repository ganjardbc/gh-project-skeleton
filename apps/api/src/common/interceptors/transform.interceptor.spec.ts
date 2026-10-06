import { CallHandler, ExecutionContext } from '@nestjs/common';
import { lastValueFrom, of } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor';

const run = (payload: unknown) => {
  const next: CallHandler = { handle: () => of(payload) };
  return lastValueFrom(
    new TransformInterceptor().intercept({} as ExecutionContext, next),
  );
};

describe('TransformInterceptor', () => {
  it('wraps a payload in { success, data }', async () => {
    await expect(run({ id: '1' })).resolves.toEqual({
      success: true,
      data: { id: '1' },
    });
  });

  it('nests a paginated result under data', async () => {
    const page = {
      data: [{ id: '1' }],
      meta: { total: 1, page: 1, limit: 10, totalPages: 1 },
    };

    await expect(run(page)).resolves.toEqual({ success: true, data: page });
  });
});
