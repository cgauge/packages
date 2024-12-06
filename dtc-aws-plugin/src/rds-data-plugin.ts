import {RDSData, SqlParameter} from '@aws-sdk/client-rds-data'
import extraAssert from '@cgauge/assert'
import {info} from '@cgauge/dtc'
import {is, unknown, diff, optional, TypeFromSchema, record, intersection} from '@cgauge/type-guard'

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

  if (response.formattedRecords) {
    return JSON.parse(response.formattedRecords)
  }
}

export const arrange = async (args: unknown) => {
  if (!is(args, {rds: [RDSDataCall]})) {
    return
  }

  await Promise.all(args.rds.map((v) => executeStatement(v as RDSDataCallSql)))
}

export const act = async (args: unknown) => {
  if (!is(args, RDSDataCall)) {
    const mismatch = diff(args, RDSDataCall)
    info(`Lambda plugin declared but test declaration didn't match the act. Invalid ${mismatch[0]}\n`)
    return
  }

  await executeStatement(args as RDSDataCallSql)
}

export const assert = async (args: unknown) => {
  if (!is(args, {rds: [RDSDataCallResponse]})) {
    return
  }

  await Promise.all(
    args.rds.map(async (v) => {
      const response = await executeStatement(v as RDSDataCallSql)

      extraAssert.objectContains(v.response, response)
    }),
  )
}

export const clean = async (args: unknown) => {
  if (!is(args, {rds: [RDSDataCall]})) {
    return
  }

  await Promise.all(args.rds.map((v) => executeStatement(v as RDSDataCallSql)))
}
