
;; Jackpot Wall - Stacks Builder Challenge
;; - Every 10th poster wins 90% of the pot
;; - Designed for High Frequency + Chainhook triggers

(define-constant err-msg-too-long (err u101))

;; Constants
(define-constant WIN_INTERVAL u10)
(define-constant PAYOUT_RATIO u90) ;; 90%

;; Data Vars
(define-data-var counter uint u0)

;; Maps
(define-map posts uint { poster: principal, message: (string-utf8 140) })

;; Public Functions

(define-public (post-message (message (string-utf8 140)))
    (let (
        (current-count (var-get counter))
        (next-count (+ current-count u1))
        (sender tx-sender)
        (contract-addr (as-contract tx-sender))
    )
        ;; 1. Store Post
        (map-set posts next-count { poster: sender, message: message })
        (var-set counter next-count)

        ;; 2. Check Jackpot Condition
        (if (is-eq (mod next-count WIN_INTERVAL) u0)
            (let (
                ;; Calculate Payout
                (pot-balance (stx-get-balance contract-addr))
                (payout (/ (* pot-balance PAYOUT_RATIO) u100))
            )
                ;; Payout Winner (sender) if pot is not empty
                (if (> payout u0)
                    (try! (as-contract (stx-transfer? payout tx-sender sender)))
                    true
                )
                
                (print { 
                    event: "jackpot-won", 
                    id: next-count, 
                    winner: sender, 
                    amount: payout,
                    is_jackpot: true 
                })
                true
            )
            ;; Else: Just Log
            (begin
                (print { event: "new-post", id: next-count, poster: sender, message: message, is_jackpot: false })
                true
            )
        )
        
        (ok next-count)
    )
)

;; Read Only

(define-read-only (get-post (id uint))
    (map-get? posts id)
)

(define-read-only (get-pot-balance)
    (stx-get-balance (as-contract tx-sender))
)

(define-read-only (get-counter)
    (var-get counter)
)

(define-read-only (get-next-poster-id)
    (var-get counter)
)
