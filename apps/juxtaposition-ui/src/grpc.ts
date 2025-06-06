import { createChannel, createClient } from 'nice-grpc';
import { MiiverseServiceDefinition } from '@repo/grpc-client/out/miiverse_service';
import { config } from '@/config';

export const grpcChannel = createChannel(`${config.grpc.miiverse.host}:${config.grpc.miiverse.port}`);
export const grpcClient = createClient(MiiverseServiceDefinition, grpcChannel);
