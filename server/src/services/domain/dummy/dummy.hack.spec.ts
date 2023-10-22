import { createChannel, createClient, Metadata } from 'nice-grpc';
import { main, shutdownComponents } from '../../../main/main';
import { v4 as uuid } from 'uuid';
import { isE2E, useHost, usePorts } from '../../../../tests/utils';
import {
  DummyServiceClient,
  DummyServiceDefinition,
} from '../../../libs/client';

describe('Dummy: Hack Attempts', () => {
  let client: DummyServiceClient;
  const metadata = new Metadata();
  metadata.set('external', 'false');
  const invalidJwt =
    'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0In0.CQeNpTcAALHBIfPmIw8kscb5VqDvACxTmewZ-cvVptM';
  metadata.set('jwt', invalidJwt);
  metadata.set(
    'authData',
    JSON.stringify({
      jwt: invalidJwt,
      decoded: { sub: '123' },
      external: false,
      permitted: [{ permittedEntityId: '123', permittedEntity: 'user' }],
      entity: 'trip',
      entityId: '123',
    }),
  );

  beforeAll(async () => {
    const ports = await usePorts();
    const host = useHost();
    const channel = createChannel(`${host}:${ports.proto}`);
    client = createClient(DummyServiceDefinition, channel);
    if (!isE2E()) await main({ ports });
  });

  afterAll(async () => {
    if (!isE2E()) await shutdownComponents();
  });

  test('CreateOne', async () => {
    const input = {
      text: uuid(),
    };
    await expect(client.createOne(input, { metadata })).rejects.toThrow(
      'permission denied',
    );
  });

  test('FindOne', async () => {
    const input = {
      id: uuid(),
    };
    await expect(client.findOne(input, { metadata })).rejects.toThrow(
      'permission denied',
    );
  });

  test('RemoveOne', async () => {
    const input = {
      id: uuid(),
    };
    await expect(client.removeOne(input, { metadata })).rejects.toThrow(
      'permission denied',
    );
  });

  test('Search', async () => {
    const input = { text: uuid().replace(/-/g, ' ') };
    const token = input.text.split(' ')[0];
    await expect(
      client.search(
        {
          filter: { text: token },
          opts: { limit: 10, waitForSync: true },
        },
        { metadata },
      ),
    ).rejects.toThrow('permission denied');
  });
});
