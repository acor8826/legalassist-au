# Deploy Notes

1. Ensure environment variables are set in your hosting platform.
2. Enable feature flag for a small cohort first (e.g., 10%).
3. Monitor:
   - Errors: sentry error rate < 1%
   - P95 latency < 1s end-to-end
   - Websocket connection stability
4. Expand rollout progressively if stable.
5. Rollback by disabling the feature flag; purge CDN if needed.
