import {GetObjectCommand, HeadObjectCommand} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';
import {validateBucketName} from '@remotion/serverless/client';
import type {AwsRegion} from '../regions';
import {getS3Client} from '../shared/get-s3-client';
import {validatePresignExpiration} from '../shared/validate-presign-expiration';

type MandatoryParameters = {
	region: AwsRegion;
	bucketName: string;
	objectKey: string;
	expiresInSeconds: number;
};

type OptionalParameters<CheckIfObjectExists extends boolean> = {
	checkIfObjectExists: CheckIfObjectExists;
	forcePathStyle: boolean;
};

export type PresignUrlInput<CheckIfObjectExists extends boolean = boolean> =
	MandatoryParameters & Partial<OptionalParameters<CheckIfObjectExists>>;
type PresignUrlInputInternal<CheckIfObjectExists extends boolean> =
	MandatoryParameters & OptionalParameters<CheckIfObjectExists>;

const internalPresignUrl = async <CheckIfObjectExists extends boolean = false>({
	region,
	bucketName,
	objectKey,
	checkIfObjectExists,
	expiresInSeconds,
	forcePathStyle,
}: PresignUrlInputInternal<CheckIfObjectExists>): Promise<
	CheckIfObjectExists extends true ? string | null : string
> => {
	validateBucketName(bucketName, {mustStartWithRemotion: false});
	validatePresignExpiration(expiresInSeconds);

	const s3Client = getS3Client({
		region,
		customCredentials: null,
		forcePathStyle,
	});

	if (checkIfObjectExists === true) {
		try {
			await s3Client.send(
				new HeadObjectCommand({
					Bucket: bucketName,
					Key: objectKey,
				}),
			);
		} catch (err) {
			if ((err as {name: string}).name === 'NotFound') {
				return null as unknown as string;
			}

			if (
				(err as Error).message === 'UnknownError' ||
				(err as {$metadata: {httpStatusCode: number}}).$metadata
					.httpStatusCode === 403
			) {
				throw new Error(
					`Unable to access item "${objectKey}" from bucket "${bucketName}". You must have permission for both "s3:GetObject" and "s3:ListBucket" actions.`,
				);
			}

			throw err;
		}
	}

	const objCommand = new GetObjectCommand({
		Bucket: bucketName,
		Key: objectKey,
	});

	const publicUrl = await getSignedUrl(s3Client, objCommand, {
		expiresIn: expiresInSeconds,
	});

	return publicUrl;
};

/**
 * @description Returns a public url of an object stored in Remotion's S3 bucket.
 * @see [Documentation](https://remotion.dev/docs/lambda/presignurl)
 * @param {AwsRegion} params.region The region in which the S3 bucket resides in.
 * @param {string} params.bucketName The name of the bucket to fetch the object from.
 * @param {string} params.objectKey Key of the S3 object to get.
 * @param {string} params.expiresIn The number of seconds before the presigned URL expires. Default 120.
 * @param {boolean} params.checkIfObjectExists Whether the function should check if the object exists in the bucket before generating the presigned url.
 * @returns {Promise<string | null>} The public url of an object or `null` if `checkIfObjectExists=true` & object does not exist.
 */
export const presignUrl = <CheckIfObjectExists extends boolean = false>({
	region,
	bucketName,
	objectKey,
	checkIfObjectExists,
	expiresInSeconds,
	forcePathStyle,
}: PresignUrlInput<CheckIfObjectExists>): Promise<
	CheckIfObjectExists extends true ? string | null : string
> => {
	return internalPresignUrl({
		region,
		bucketName,
		objectKey,
		checkIfObjectExists: checkIfObjectExists ?? false,
		expiresInSeconds,
		forcePathStyle: forcePathStyle ?? false,
	});
};
