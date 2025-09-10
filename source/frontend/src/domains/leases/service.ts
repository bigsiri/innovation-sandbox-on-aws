// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { LeaseWithLeaseId } from "@amzn/innovation-sandbox-commons/data/lease/lease";
import {
  LeasePatchRequest,
  MonitoredLeaseWithLeaseId,
  NewLeaseRequest,
} from "@amzn/innovation-sandbox-frontend/domains/leases/types";
import {
  ApiProxy,
  IApiProxy,
} from "@amzn/innovation-sandbox-frontend/helpers/ApiProxy";
import { ApiPaginatedResult } from "@amzn/innovation-sandbox-frontend/types";

export interface LeaseUser {
  userEmail: string;
  addedBy: string;
  addedDate: string;
  assignmentStatus?: {
    status: "SUCCEEDED" | "FAILED";
    message?: string;
    lastUpdated: string;
  };
  permissionSetArn?: string;
}

export interface LeaseUsersResponse {
  users: LeaseUser[];
  totalCount: number;
}

export interface AddUsersResponse {
  successCount: number;
  failureCount: number;
  results: Array<{
    userEmail: string;
    success: boolean;
    message?: string;
  }>;
}

export interface SharedLease {
  leaseId: string;
  uuid: string;
  userEmail: string;
  status: string;
  originalLeaseTemplateUuid: string;
  originalLeaseTemplateName: string;
  leaseDurationInHours: number;
  maxSpend: number;
  budgetThresholds: any[];
  durationThresholds: any[];
  ownerEmail: string;
  ownerDisplayName: string;
  sharedAt: string;
  sharedBy: string;
  meta?: {
    schemaVersion: number;
    createdTime?: string;
    lastEditTime?: string;
  };
  awsAccountId?: string;
  approvedBy?: string;
  startDate?: string;
  expirationDate?: string;
  lastCheckedDate?: string;
  totalCostAccrued?: number;
  users?: LeaseUser[];
  comments?: string;
}

export interface SharedLeasesResponse {
  leases: SharedLease[];
  totalCount: number;
  hasMore: boolean;
}

export class LeaseService {
  private api: IApiProxy;

  constructor(apiProxy?: IApiProxy) {
    this.api = apiProxy ?? new ApiProxy();
  }

  async getLeases(userEmail?: string): Promise<LeaseWithLeaseId[]> {
    let allLeases: LeaseWithLeaseId[] = [];
    let nextPageIdentifier: string | null = null;

    // keep calling the API until all leases are collected
    do {
      let url: string = nextPageIdentifier
        ? `/leases?pageIdentifier=${nextPageIdentifier}`
        : "/leases";

      if (userEmail) {
        url +=
          (url.includes("?") ? "&" : "?") +
          `userEmail=${encodeURIComponent(userEmail)}`;
      }

      const response =
        await this.api.get<ApiPaginatedResult<LeaseWithLeaseId>>(url);

      allLeases = [...allLeases, ...response.result];
      nextPageIdentifier = response.nextPageIdentifier;
    } while (nextPageIdentifier !== null);

    return allLeases;
  }

  async getLeaseById(
    id: string,
  ): Promise<MonitoredLeaseWithLeaseId | undefined> {
    const lease = await this.api.get<MonitoredLeaseWithLeaseId | undefined>(
      `/leases/${id}`,
    );
    return lease;
  }

  async requestNewLease(request: NewLeaseRequest): Promise<void> {
    await this.api.post("/leases", request);
  }

  async updateLease(request: LeasePatchRequest): Promise<void> {
    const { leaseId, ...rest } = request;
    await this.api.patch(`/leases/${leaseId}`, rest);
  }

  async reviewLease(leaseId: string, approve: boolean): Promise<void> {
    await this.api.post(`/leases/${leaseId}/review`, {
      action: approve ? "Approve" : "Deny",
    });
  }

  async terminateLease(leaseId: string): Promise<void> {
    await this.api.post(`/leases/${leaseId}/terminate`);
  }

  async freezeLease(leaseId: string): Promise<void> {
    await this.api.post(`/leases/${leaseId}/freeze`);
  }

  // User management methods
  async getLeaseUsers(leaseId: string): Promise<LeaseUsersResponse> {
    const lease = await this.api.get<MonitoredLeaseWithLeaseId>(`/leases/${leaseId}`);
    return {
      users: lease.users || [],
      totalCount: lease.users?.length || 0,
    };
  }

  async addUsersToLease(leaseId: string, userEmails: string[]): Promise<AddUsersResponse> {
    return await this.api.post<AddUsersResponse>(`/leases/${leaseId}/users`, { userEmails });
  }

  async removeUserFromLease(leaseId: string, userEmail: string): Promise<void> {
    await this.api.delete(`/leases/${leaseId}/users`, { userEmails: [userEmail] });
  }

  async getSharedLeases(options?: {
    limit?: number;
    status?: string;
    includeOwned?: boolean;
  }): Promise<SharedLeasesResponse> {
    const params = new URLSearchParams();
    
    if (options?.limit) {
      params.append('limit', options.limit.toString());
    }
    if (options?.status) {
      params.append('status', options.status);
    }
    if (options?.includeOwned !== undefined) {
      params.append('includeOwned', options.includeOwned.toString());
    }

    const response = await this.api.get<ApiPaginatedResult<LeaseWithLeaseId>>(`/leases?${params}`);
    
    return {
      leases: response.result.map((lease: LeaseWithLeaseId): SharedLease => ({
        leaseId: lease.leaseId,
        uuid: lease.uuid,
        userEmail: lease.userEmail,
        status: lease.status,
        originalLeaseTemplateUuid: lease.originalLeaseTemplateUuid,
        originalLeaseTemplateName: lease.originalLeaseTemplateName,
        leaseDurationInHours: lease.leaseDurationInHours || 0,
        maxSpend: lease.maxSpend || 0,
        budgetThresholds: lease.budgetThresholds || [],
        durationThresholds: lease.durationThresholds || [],
        ownerEmail: lease.userEmail,
        ownerDisplayName: lease.userEmail,
        sharedAt: lease.meta?.createdTime || new Date().toISOString(),
        sharedBy: lease.userEmail,
        awsAccountId: 'awsAccountId' in lease ? lease.awsAccountId : undefined,
        approvedBy: 'approvedBy' in lease ? lease.approvedBy : undefined,
        startDate: 'startDate' in lease ? lease.startDate : undefined,
        expirationDate: 'expirationDate' in lease ? lease.expirationDate : undefined,
        users: 'users' in lease ? lease.users : undefined,
      })),
      totalCount: response.result.length,
      hasMore: response.nextPageIdentifier !== null,
    };
  }
}
