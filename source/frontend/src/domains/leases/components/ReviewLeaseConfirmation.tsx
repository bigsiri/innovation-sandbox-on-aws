// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import {
  showErrorToast,
  showSuccessToast,
} from "@amzn/innovation-sandbox-frontend/components/Toast";
import { useReviewLease } from "@amzn/innovation-sandbox-frontend/domains/leases/hooks";
import { Box, Button } from "@cloudscape-design/components";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const ReviewLeaseConfirmation = ({
  mode,
  leaseId,
  onCancel,
}: {
  mode: "approve" | "deny";
  leaseId: string;
  onCancel: () => any;
}) => {
  const { t } = useTranslation(['approvals', 'common']);
  const { mutateAsync: reviewLease, isPending: reviewLeaseIsLoading } =
    useReviewLease();
  const navigate = useNavigate();

  return (
    <Box>
      {t("confirmReviewRequest", { ns: "approvals", mode: t(mode, { ns: "approvals" }) })}
      <Box textAlign="right" padding={{ top: "m" }}>
        <Button variant="link" onClick={onCancel}>
          {t("cancel", { ns: "common" })}
        </Button>
        <Button
          loading={reviewLeaseIsLoading}
          onClick={() => {
            reviewLease(
              {
                leaseId,
                approve: mode === "approve",
              },
              {
                onSuccess: () => {
                  onCancel();
                  navigate("/approvals");
                  showSuccessToast(
                    t(mode === "approve" ? "requestApproved" : "requestDenied", { ns: "approvals" })
                  );
                },
                onError: (error: any) => {
                  if (error instanceof Error) {
                    showErrorToast(error.message);
                  }
                },
              },
            );
          }}
        >
          {t("confirm", { ns: "common" })}
        </Button>
      </Box>
    </Box>
  );
};
