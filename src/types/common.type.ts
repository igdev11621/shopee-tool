import { Entity } from 'telegram/define';

export type ChannelEntity = Entity & {
  accessHash: bigInt.BigInteger;
};
