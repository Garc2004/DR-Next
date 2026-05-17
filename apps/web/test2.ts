import { valibotResolver } from '@hookform/resolvers/valibot';
import * as v from 'valibot';

const Schema = v.pipe(v.object({ a: v.string() }));
const resolver = valibotResolver(Schema);
