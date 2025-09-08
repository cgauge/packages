import {RDSData, SqlParameter} from '@aws-sdk/client-rds-data'
import extraAssert from '@cgauge/assert'
import {is, unknown, diff, optional, TypeFromSchema, record, intersection} from '@cgauge/type-guard'
import createLogger from '@cgauge/log'

const logger = createLogger('dtc:rds-data');

const RDSDataCall = {
  sql: String,
  parameters: optional([unknown]),
  resourceArn: String,
  secretArn: String,
  database: String,
}
type RDSDataCall = TypeFromSchema<typeof RDSDataCall>
type RDSDataCallSql = RDSDataCall & {parameters?: SqlParameter[]}

const RDSDataCallResponse = intersection(RDSDataCall, {
  response: record(String, unknown),
})

const rdsData = new RDSData({})

export const executeStatement = async (params: RDSDataCallSql): Promise<any> => {
  const response = await rdsData.executeStatement({
    ...params,
    formatRecordsAs: 'JSON',
  })

  logger.debug(response)

  if (response.formattedRecords) {
    return JSON.parse(response.formattedRecords)
  }
}

export const arrange = async (args: unknown) => {
  if (!('rds' in (args as any))) {
    return false
  }

  if (!is(args, {rds: [RDSDataCall]})) {
    const mismatch = diff(args, {rds: [RDSDataCall]})
    throw new Error(`(RDS Data) Invalid argument on arrange: ${mismatch[0]}`)
  }

  await Promise.all(args.rds.map((v) => executeStatement(v as RDSDataCallSql)))

  return true
}

export const act = async (args: unknown): Promise<boolean> => {
  if (!is(args, RDSDataCall)) {
    const mismatch = diff(args, RDSDataCall)
    logger.info(`Plugin declared but test declaration didn't match the act. Invalid ${mismatch[0]}`)
    return false
  }

  await executeStatement(args as RDSDataCallSql)

  return true
}

export const assert = async (args: unknown): Promise<boolean> => {
  if (!('rds' in (args as any))) {
    return false
  }

  if (!is(args, {rds: [RDSDataCallResponse]})) {
    const mismatch = diff(args, {rds: [RDSDataCallResponse]})
    throw new Error(`(RDS Data) Invalid argument on assert: ${mismatch[0]}`)
  }

  await Promise.all(
    args.rds.map(async (v) => {
      const response = await executeStatement(v as RDSDataCallSql)

      extraAssert.objectContains(v.response, response)
    }),
  )

  return true
}

export const clean = async (args: unknown) => {
  if (!('rds' in (args as any))) {
    return false
  }

  if (!is(args, {rds: [RDSDataCall]})) {
    const mismatch = diff(args, {rds: [RDSDataCall]})
    throw new Error(`(RDS Data) Invalid argument on clean: ${mismatch[0]}`)
  }

  await Promise.all(args.rds.map((v) => executeStatement(v as RDSDataCallSql)))

  return true
}
