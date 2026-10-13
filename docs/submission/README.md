# Submission assets

Updated 13 October 2026.

| Asset | Link |
| --- | --- |
| One-page product note | [PDF](Retention_Agent_Product_Note.pdf) |
| AI build log | [docs/AI_BUILD_LOG.md](../AI_BUILD_LOG.md) |
| Working prototype | [smart-retention-razorpay.lovable.app](https://smart-retention-razorpay.lovable.app/) |

> In a synthetic 90-day scenario with one campaign opportunity per customer across the same 2,500 customers, the agent raised collected earnings by 7.2% before the fee and 5.4% after it over no outreach, under default response assumptions. A blanket 20%-off sale raised them by 0.3%. If messages create no additional orders, the sale loses 4.3% to discounts while the agent loses 0.4%.

The agent works from Shopify orders, the payment provider's payments and refunds, and the courier's COD and return outcomes; these connections are simulated in the prototype. Razorpay checkout is not required, so the product could reach D2C merchants who process payments elsewhere; whether that leads them to move processing to Razorpay is a hypothesis to test.

The full sensitivity analysis, including a store-data-only run, is in [`data/nira/benchmark_results.csv`](../../data/nira/benchmark_results.csv).
