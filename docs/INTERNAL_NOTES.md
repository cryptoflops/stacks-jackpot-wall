# Internal Developer Notes

- Contract calls via openContractCall work fine but the transaction broadcast can take 10-30 blocks.
- Checked backward compatibility with older Stacks API responses. v2/info endpoint is stable.
- The wallet connection flow via @stacks/connect works well on desktop but needs mobile fallback.
- Checked backward compatibility with older Stacks API responses. v2/info endpoint is stable.
- The wallet connection flow via @stacks/connect works well on desktop but needs mobile fallback.
- Tested STX transfer flow on testnet. Post-conditions correctly prevent over-spending.
- Reviewed component tree performance after adding STX balance polling, no measurable regression.
- Noticed the useStxBalance hook refetches too aggressively. Consider adding a 30s polling interval.
- Contract calls via openContractCall work fine but the transaction broadcast can take 10-30 blocks.
- Checked backward compatibility with older Stacks API responses. v2/info endpoint is stable.
- Contract calls via openContractCall work fine but the transaction broadcast can take 10-30 blocks.
- Checked backward compatibility with older Stacks API responses. v2/info endpoint is stable.
- Contract calls via openContractCall work fine but the transaction broadcast can take 10-30 blocks.
- Checked backward compatibility with older Stacks API responses. v2/info endpoint is stable.
