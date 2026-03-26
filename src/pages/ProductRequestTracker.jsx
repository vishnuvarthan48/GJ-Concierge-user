import { Box, Typography, CircularProgress, IconButton, Stack } from "@mui/material";
import ArrowBack from "@mui/icons-material/ArrowBack";
import CheckCircle from "@mui/icons-material/CheckCircle";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Header from "../layout/Header";
import BottomNavBar from "../layout/BottomNavBar";
import { getProductRequestDetail } from "../service/ProductRequestService";

function formatDate(value) {
  if (value == null) return "—";
  const d = new Date(typeof value === "number" ? value : value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString();
}

function ProductRequestTracker() {
  const { tenantId, roomId, requestId } = useParams();
  const navigate = useNavigate();

  const { data: detail, isLoading, isError } = useQuery({
    queryKey: ["productRequestDetail", tenantId, roomId, requestId],
    queryFn: () => getProductRequestDetail(tenantId, roomId, requestId),
    enabled: !!tenantId && !!roomId && !!requestId,
  });

  const groupItems = detail?.groupItems ?? (detail ? [detail] : []);
  const productNames = groupItems
    .map((i) => i?.product?.name)
    .filter(Boolean)
    .join(", ") || detail?.product?.name || "—";
  const totalQuantity = groupItems.reduce((sum, i) => sum + (Number(i?.quantity) || 0), 0);
  const totalAmount = groupItems.reduce((sum, i) => sum + (Number(i?.amount) || 0), 0);

  const histories = detail?.histories ?? [];
  const sortedHistories = [...histories].sort((a, b) => {
    const tA = a.createdOn ?? a.createdDate ?? 0;
    const tB = b.createdOn ?? b.createdDate ?? 0;
    if (tA !== tB) return tA - tB;
    const posA = a.status?.position ?? 999;
    const posB = b.status?.position ?? 999;
    return posA - posB;
  });

  const currentStatus =
    detail?.status?.displayName ?? detail?.status?.name ?? "—";

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", pb: 10 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <IconButton
          onClick={() => navigate(-1)}
          size="small"
          aria-label="Go back"
          sx={{ mr: 0.5 }}
        >
          <ArrowBack />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
          Order tracker
        </Typography>
      </Box>

      <Box sx={{ px: 2, py: 3 }}>
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        )}

        {isError && (
          <Typography color="error" sx={{ py: 3 }}>
            Failed to load order details.
          </Typography>
        )}

        {!isLoading && !isError && detail && (
          <>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "background.paper",
                boxShadow: 1,
                mb: 3,
              }}
            >
              <Typography variant="subtitle2" color="text.secondary">
                Product
              </Typography>
              {groupItems.length > 1 ? (
                <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                  {groupItems.map((item, idx) => (
                    <Typography key={item?.id || idx} variant="body1" sx={{ fontWeight: 600 }}>
                      • {item?.product?.name || "—"}
                      {item?.quantity != null && ` (Qty: ${item.quantity})`}
                    </Typography>
                  ))}
                </Stack>
              ) : (
                <Typography variant="h6" sx={{ fontWeight: 600, mt: 0.5 }}>
                  {productNames}
                  {detail?.quantity != null && ` (Qty: ${detail.quantity})`}
                </Typography>
              )}
              {(totalAmount > 0 || detail?.amount != null) && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Total: ₹{Number(groupItems.length > 1 ? totalAmount : detail.amount).toFixed(0)}
                </Typography>
              )}
              <Box
                sx={{
                  mt: 2,
                  display: "inline-block",
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 2,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {currentStatus}
                </Typography>
              </Box>
              {(detail.userName || detail.phoneNumber) && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  {detail.userName && `${detail.userName} • `}
                  {detail.phoneNumber}
                </Typography>
              )}
              {detail?.assignedTo && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Assigned to:{" "}
                  {[detail.assignedTo?.user?.firstName, detail.assignedTo?.user?.lastName]
                    .filter(Boolean)
                    .join(" ") ||
                    detail.assignedTo?.user?.name ||
                    "—"}
                </Typography>
              )}
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 1 }}
              >
                Request ID: {detail.id}
              </Typography>
            </Box>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              Status timeline
            </Typography>

            {sortedHistories.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No status updates yet.
              </Typography>
            ) : (
              <Box sx={{ position: "relative" }}>
                {sortedHistories.map((h, index) => {
                  const isCurrent = index === sortedHistories.length - 1;
                  const isCompleted = !isCurrent;
                  const label = h.status?.displayName ?? h.status?.name ?? "Update";
                  const date = h.createdOn ?? h.createdDate;
                  const comment = index === 0 && detail?.comment ? (detail.comment || h.comment) : h.comment;
                  const hasNext = index < sortedHistories.length - 1;

                  return (
                    <Box
                      key={h.id || index}
                      sx={{
                        position: "relative",
                        display: "flex",
                        gap: 2,
                        pb: hasNext ? 0 : 0,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          width: 40,
                          flexShrink: 0,
                        }}
                      >
                        {isCompleted ? (
                          <CheckCircle
                            sx={{
                              fontSize: 28,
                              color: "success.main",
                              mb: hasNext ? -1 : 0,
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              bgcolor: "primary.main",
                              border: "3px solid",
                              borderColor: "primary.light",
                              boxShadow: 2,
                              mb: hasNext ? -1 : 0,
                            }}
                          />
                        )}
                        {hasNext && (
                          <Box
                            sx={{
                              flex: 1,
                              width: 3,
                              minHeight: 24,
                              borderRadius: 2,
                              bgcolor: "success.main",
                              opacity: 0.5,
                              mt: 0.5,
                            }}
                          />
                        )}
                      </Box>

                      <Box
                        sx={{
                          flex: 1,
                          p: 2,
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: isCurrent ? "primary.main" : "divider",
                          bgcolor: isCurrent ? "primary.main" : "action.hover",
                          color: isCurrent
                            ? "primary.contrastText"
                            : "text.primary",
                          boxShadow: isCurrent ? 2 : 0,
                          mb: hasNext ? 2 : 0,
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          fontWeight={700}
                          sx={{ color: "inherit" }}
                        >
                          {label}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            mt: 0.5,
                            color: isCurrent
                              ? "primary.contrastText"
                              : "text.secondary",
                            opacity: isCurrent ? 0.9 : 1,
                          }}
                        >
                          {formatDate(date)}
                        </Typography>
                        {comment && (
                          <Typography
                            variant="body2"
                            sx={{
                              mt: 1,
                              color: "inherit",
                              opacity: isCurrent ? 0.95 : 0.85,
                            }}
                          >
                            {comment}
                          </Typography>
                        )}
                        {Array.isArray(h?.attachments) && h.attachments.length > 0 && (
                          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
                            {h.attachments.map((at, i) => {
                              const url = at?.attachment?.mediaUrl;
                              if (!url) return null;
                              return (
                                <Box
                                  key={at?.id ?? i}
                                  component="a"
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{
                                    display: "block",
                                    width: 72,
                                    height: 72,
                                    borderRadius: 1,
                                    overflow: "hidden",
                                    border: "1px solid",
                                    borderColor: "divider",
                                    flexShrink: 0,
                                  }}
                                >
                                  <Box
                                    component="img"
                                    src={url}
                                    alt=""
                                    sx={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                </Box>
                              );
                            })}
                          </Stack>
                        )}
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </>
        )}
      </Box>

      <BottomNavBar />
    </Box>
  );
}

export default ProductRequestTracker;
