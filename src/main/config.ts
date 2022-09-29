
export type PplnsConfig =
{
  // automatically runs bundler after inserting an item
  runBundlerAfterItemInsert: boolean;
}

export let config : PplnsConfig = 
{
  runBundlerAfterItemInsert: false,
};

/**
 * @param c config settings
 * @returns void
 */
export function editConfig(c : Partial<PplnsConfig>)
{
  config = { ...config, ...c };
}
