import { Block, HardhatEthers, BigNumber } from '../types';

function BlockUtils(ethers: HardhatEthers) {
  const {
    utils: { hexValue },
    BigNumber: BN,
  } = ethers;

  const isAutomine = (): Promise<boolean> => {
    return ethers.provider.send('hardhat_getAutomine', []);
  };

  const setAutomine = (enabled: boolean): Promise<boolean> => {
    return ethers.provider.send('evm_setAutomine', [!!enabled]);
  };

  const setIntervalMining = (ms: number | BigNumber): Promise<boolean> => {
    if (BN.isBigNumber(ms)) {
      ms = ms.toNumber();
    }

    if (ms < 0) {
      throw Error(`Cannot set negative interval mining: ${ms}`);
    }

    return ethers.provider.send('evm_setIntervalMining', [ms]);
  };

  const latest = (): Promise<Block> => {
    return ethers.provider.getBlock('latest');
  };

  const latestBlockNumber = (): Promise<number> => {
    return ethers.provider.getBlockNumber();
  };

  const advanceBlock = (
    n: number | BigNumber = 1,
    interval: number | BigNumber = 60,
  ): Promise<boolean> => {
    if (BN.isBigNumber(n)) {
      n = n.toNumber();
    }

    if (BN.isBigNumber(interval)) {
      interval = interval.toNumber();
    }

    if (n < 0) {
      throw Error(`Cannot advance negative blocks: ${n}`);
    }

    return ethers.provider.send('hardhat_mine', [hexValue(n), hexValue(interval)]);
  };

  const advanceBlockTo = async (
    target: number | BigNumber,
    interval: number | BigNumber = 60,
  ): Promise<boolean> => {
    if (BN.isBigNumber(target)) {
      target = target.toNumber();
    }

    const latest = await latestBlockNumber();
    if (target <= latest) {
      throw Error(
        `Cannot advance to the block number ${target} which is not greater that current block number ${latest}`,
      );
    }

    return advanceBlock(target - latest, interval);
  };

  return {
    isAutomine,
    setAutomine,
    latest,
    latestBlockNumber,
    advanceBlock,
    advanceBlockTo,
    setIntervalMining,
  };
}

export default BlockUtils;
