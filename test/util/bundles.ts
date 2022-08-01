
import { Bundle, BundleRead, Worker } from '../../src/schemas/pipeline';

/**
 * Sort bundle input items either by inputs or alphabetically.
 * @param bundle bundle
 * @param inputs inputs (will sort alphabetically if not defined)
 * @returns void
 */
export function sortBundleItems(
  bundle : Bundle | BundleRead,
  inputs?: Worker['inputs'],
)
{
  bundle.inputItems = inputs ? 
    bundle.inputItems.sort(
      ({ inputChannel }) => 
        Object.keys(inputs).findIndex((c) => c === inputChannel)
      ,
    ) :
    null
  ;
  
  if ('items' in bundle)
  {
    bundle.items = bundle.inputItems.map(
      ({ itemId }) => bundle.items.find(({ _id }) => _id.equals(itemId)),
    );
  }
}
