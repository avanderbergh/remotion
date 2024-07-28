import type {Readable} from 'stream';
import type {CustomCredentials, DownloadBehavior, Privacy} from './constants';
import type {GetFolderFiles} from './get-files-in-folder';
import type {CloudProvider} from './still';

export type BucketWithLocation<Provider extends CloudProvider> = {
	name: string;
	creationDate: number;
	region: Provider['region'];
};

type GetBuckets<Provider extends CloudProvider> = (
	region: Provider['region'],
	forceBucketName?: string,
) => Promise<BucketWithLocation<Provider>[]>;

type CreateBucket<Provider extends CloudProvider> = (params: {
	region: Provider['region'];
	bucketName: string;
}) => Promise<void>;

type ApplyLifeCycle<Provider extends CloudProvider> = (params: {
	enableFolderExpiry: boolean | null;
	bucketName: string;
	region: Provider['region'];
	customCredentials: CustomCredentials<Provider> | null;
}) => Promise<void>;

type BucketObject = {
	Key: string;
	LastModified: Date;
	ETag: string;
	Size: number;
};

type ListObjects<Provider extends CloudProvider> = (params: {
	bucketName: string;
	prefix: string;
	region: Provider['region'];
	expectedBucketOwner: string | null;
	continuationToken?: string;
}) => Promise<BucketObject[]>;

type DeleteFile<Provider extends CloudProvider> = (params: {
	bucketName: string;
	key: string;
	region: Provider['region'];
	customCredentials: CustomCredentials<Provider> | null;
}) => Promise<void>;

type BucketExists<Provider extends CloudProvider> = (params: {
	bucketName: string;
	region: Provider['region'];
	expectedBucketOwner: string | null;
}) => Promise<boolean>;

type ReadFile<Provider extends CloudProvider> = (params: {
	bucketName: string;
	key: string;
	region: Provider['region'];
	expectedBucketOwner: string;
}) => Promise<Readable>;

export type WriteFileInput<Provider extends CloudProvider> = {
	bucketName: string;
	key: string;
	body: Readable | string | Uint8Array;
	region: Provider['region'];
	privacy: Privacy;
	expectedBucketOwner: string | null;
	downloadBehavior: DownloadBehavior | null;
	customCredentials: CustomCredentials<Provider> | null;
};

type WriteFile<Provider extends CloudProvider> = (
	params: WriteFileInput<Provider>,
) => Promise<void>;

type HeadFileInput<Provider extends CloudProvider> = {
	bucketName: string;
	key: string;
	region: Provider['region'];
	customCredentials: CustomCredentials<Provider> | null;
};

type HeadFileOutput = {
	LastModified?: Date | undefined;
	ContentLength?: number | undefined;
};

type HeadFile<Provider extends CloudProvider> = (
	params: HeadFileInput<Provider>,
) => Promise<HeadFileOutput>;

type RandomHash = () => string;

type ConvertToServeUrl<Provider extends CloudProvider> = (params: {
	urlOrId: string;
	region: Provider['region'];
	bucketName: string;
}) => string;

export type ProviderSpecifics<Provider extends CloudProvider> = {
	getChromiumPath: () => string | null;
	getCurrentRegionInFunction: () => Provider['region'];
	getBuckets: GetBuckets<Provider>;
	createBucket: CreateBucket<Provider>;
	applyLifeCycle: ApplyLifeCycle<Provider>;
	listObjects: ListObjects<Provider>;
	deleteFile: DeleteFile<Provider>;
	bucketExists: BucketExists<Provider>;
	randomHash: RandomHash;
	readFile: ReadFile<Provider>;
	writeFile: WriteFile<Provider>;
	headFile: HeadFile<Provider>;
	convertToServeUrl: ConvertToServeUrl<Provider>;
	printLoggingHelper: boolean;
	getFolderFiles: GetFolderFiles;
	provider: Provider;
};
