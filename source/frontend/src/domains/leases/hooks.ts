// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { AutosuggestProps } from "@cloudscape-design/components";

import { LeaseService } from "@amzn/innovation-sandbox-frontend/domains/leases/service";
import {
  LeasePatchRequest,
  NewLeaseRequest,
} from "@amzn/innovation-sandbox-frontend/domains/leases/types";
import { AuthService } from "@amzn/innovation-sandbox-frontend/helpers/AuthService";

const fetchLeases = async () => await new LeaseService().getLeases();

export const useGetLeases = () => {
  return useQuery({
    queryKey: ["leases"],
    queryFn: fetchLeases,
  });
};

export const useGetPendingApprovals = () => {
  return useQuery({
    queryKey: ["leases"], // Same query key as useGetLeases
    queryFn: fetchLeases,
    select: (data) => {
      // Filter for pending approvals
      return data?.filter((lease) => lease.status === "PendingApproval") ?? [];
    },
  });
};

export const useGetLeasesByEmail = (email: string) => {
  return useQuery({
    queryKey: ["leases", email],
    queryFn: async () => await new LeaseService().getLeases(email),
  });
};

export const useGetLeaseById = (uuid: string) => {
  return useQuery({
    queryKey: ["leases", uuid],
    queryFn: async () => await new LeaseService().getLeaseById(uuid),
  });
};

export const useGetLeasesForCurrentUser = () => {
  return useQuery({
    queryKey: ["leases", "CURRENT_USER"],
    queryFn: async () => {
      const user = await AuthService.getCurrentUser();
      return await new LeaseService().getLeases(user?.email);
    },
  });
};

export const useRequestNewLease = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (request: NewLeaseRequest) =>
      await new LeaseService().requestNewLease(request),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["leases"], refetchType: "all" });
      client.invalidateQueries({ queryKey: ["accounts"], refetchType: "all" });
    },
  });
};

export const useUpdateLease = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (request: LeasePatchRequest) =>
      await new LeaseService().updateLease(request),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["leases"], refetchType: "all" });
    },
  });
};

export const useReviewLease = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({
      leaseId,
      approve,
    }: {
      leaseId: string;
      approve: boolean;
    }) => {
      await new LeaseService().reviewLease(leaseId, approve);
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["leases"], refetchType: "all" });
      client.invalidateQueries({ queryKey: ["accounts"], refetchType: "all" });
    },
  });
};

export const useTerminateLease = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (leaseId: string) => {
      await new LeaseService().terminateLease(leaseId);
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["leases"], refetchType: "all" });
      client.invalidateQueries({ queryKey: ["accounts"], refetchType: "all" });
    },
  });
};

export const useFreezeLease = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (leaseId: string) => {
      await new LeaseService().freezeLease(leaseId);
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ["leases"], refetchType: "all" });
      client.invalidateQueries({ queryKey: ["accounts"], refetchType: "all" });
    },
  });
};

// User management hooks
export const useGetLeaseUsers = (leaseId: string) => {
  return useQuery({
    queryKey: ["lease-users", leaseId],
    queryFn: async () => await new LeaseService().getLeaseUsers(leaseId),
    enabled: !!leaseId,
  });
};

export const useAddUserToLease = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ leaseId, userEmails }: { leaseId: string; userEmails: string[] }) => {
      return await new LeaseService().addUsersToLease(leaseId, userEmails);
    },
    onSuccess: (_, { leaseId }) => {
      client.invalidateQueries({ queryKey: ["lease-users", leaseId] });
      client.invalidateQueries({ queryKey: ["leases"] });
    },
  });
};

export const useRemoveUserFromLease = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async ({ leaseId, userEmail }: { leaseId: string; userEmail: string }) => {
      await new LeaseService().removeUserFromLease(leaseId, userEmail);
    },
    onSuccess: (_, { leaseId }) => {
      client.invalidateQueries({ queryKey: ["lease-users", leaseId] });
      client.invalidateQueries({ queryKey: ["leases"] });
    },
  });
};

export const useGetSharedLeases = (options?: {
  limit?: number;
  status?: string;
  includeOwned?: boolean;
}) => {
  return useQuery({
    queryKey: ["shared-leases", options],
    queryFn: async () => await new LeaseService().getSharedLeases(options),
  });
};

interface User {
  email: string;
  displayName?: string;
}

export const useUserSearch = (existingUsers: string[] = []) => {
  const [value, setValue] = useState("");
  const [options, setOptions] = useState<AutosuggestProps.Option[]>([]);
  const [status, setStatus] = useState<AutosuggestProps.StatusType>("finished");

  const leaseService = new LeaseService();

  const searchUsers = useCallback(async (searchText: string): Promise<User[]> => {
    if (searchText.length < 2) return [];

    try {
      const response = await leaseService.searchUsers(searchText, 10);
      return response.users.map(user => ({
        email: user.email,
        displayName: user.displayName,
      }));
    } catch (error) {
      return [];
    }
  }, []);

  const handleLoadItems = useCallback(async ({ detail }: { detail: AutosuggestProps.LoadItemsDetail }) => {
    const { filteringText } = detail;
    if (filteringText.length < 2) {
      setOptions([]);
      setStatus("finished");
      return;
    }

    setStatus("loading");
      
    try {
      const users = await searchUsers(filteringText);
      const newOptions: AutosuggestProps.Option[] = users.map(user => ({
        value: user.email,
        label: user.displayName ? `${user.displayName} (${user.email})` : user.email,
        description: user.displayName ? user.email : undefined,
      }));
      
      // Add option to use the typed text as email if it's a valid email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(filteringText) && !users.some(u => u.email === filteringText) && !existingUsers.includes(filteringText)) {
        newOptions.unshift({
          value: filteringText,
          label: filteringText,
          description: "Add this email address",
        });
      }
      
      setOptions(newOptions);
      setStatus("finished");
    } catch (error) {
      setOptions([]);
      setStatus("error");
    }
  }, [searchUsers, existingUsers]);

  const handleSelect = useCallback((selectedEmail: string) => {
    const selectedOption = options.find(opt => opt.value === selectedEmail);
    
    const user: User = {
      email: selectedEmail,
      displayName: selectedOption?.label !== selectedEmail ? 
        selectedOption?.label?.split(' (')[0] : undefined
    };

    setValue("");
    setOptions([]);
    return user;
  }, [options]);

  return {
    value,
    setValue,
    options,
    status,
    handleLoadItems,
    handleSelect,
  };
};
