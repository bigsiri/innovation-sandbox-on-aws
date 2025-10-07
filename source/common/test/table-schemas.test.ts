// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * maintaining accurate and consistent schema versions for all tables is critical to the update methodology
 * of the solution (described in ADR-0002)
 *
 * this file tests that all schemas match their specified schema version. if a test fails, the test should be
 * updated to pass ONLY after verifying that schema versions have been correctly maintained.
 *
 * rules for updating schema version:
 *   - if any fields have been added or changed since the last public release of the solution, the schema version
 *   must be incremented exactly once for the next release of the solution.
 *   - changes to any schema must also include a migration script and related migration test (under test/migration)
 *   that ensures data can be safely migrated.
 */
import objectHash from "object-hash";
import { expect, test } from "vitest";

import {
  LeaseTemplateSchema,
  LeaseTemplateSchemaVersion,
} from "@amzn/innovation-sandbox-commons/data/lease-template/lease-template.js";
import {
  ApprovalDeniedLeaseSchema,
  ExpiredLeaseSchema,
  LeaseSchemaVersion,
  MonitoredLeaseSchema,
  PendingLeaseSchema,
} from "@amzn/innovation-sandbox-commons/data/lease/lease.js";
import {
  SandboxAccountSchema,
  SandboxAccountSchemaVersion,
} from "@amzn/innovation-sandbox-commons/data/sandbox-account/sandbox-account.js";

test("LeaseTemplate Schema Version", () => {
  //Changes to this test have critical upgrade path implications as detailed at the top of this file
  expect(objectHash.sha1(LeaseTemplateSchema.shape)).toMatchInlineSnapshot(
    `"d7e67015e55a000271070fda18a529b22af1140b"`,
  );
  expect(LeaseTemplateSchemaVersion).toEqual(1);
});

test("Lease Schema Version", () => {
  //Changes to this test have critical upgrade path implications as detailed at the top of this file
  expect(objectHash.sha1(PendingLeaseSchema.shape)).toMatchInlineSnapshot(
    `"90b7cb2b24c548c9699be282519fb1310fd9754c"`,
  );
  expect(
    objectHash.sha1(ApprovalDeniedLeaseSchema.shape),
  ).toMatchInlineSnapshot(`"f33236a577114cade28c9ccc89a02a8098f525b5"`);
  expect(objectHash.sha1(MonitoredLeaseSchema.shape)).toMatchInlineSnapshot(
    `"498bc77aaac39e189dbb535701cc5b8744acbe24"`,
  );
  expect(objectHash.sha1(ExpiredLeaseSchema.shape)).toMatchInlineSnapshot(
    `"08d63ee98fc731bd8a55c13e542b254187a358a2"`,
  );
  expect(LeaseSchemaVersion).toEqual(1);
});

test("SandboxAccount Schema Version", () => {
  //Changes to this test have critical upgrade path implications as detailed at the top of this file
  expect(objectHash.sha1(SandboxAccountSchema.shape)).toMatchInlineSnapshot(
    `"7c239f345d00a68829596c72731d34db84081497"`,
  );
  expect(SandboxAccountSchemaVersion).toEqual(1);
});
