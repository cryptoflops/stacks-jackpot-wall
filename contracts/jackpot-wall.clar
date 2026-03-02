;; Jackpot Wall - Stacks Builder Challenge
;; - 1 STX to post
;; - Every 10th poster wins 90% of the pot
;; - Designed for High Frequency + Chainhook triggers

(define-constant err-transfer-failed (err u100))
(define-constant err-msg-too-long (err u101))
(define-constant err-already-paid (err u102))
(define-constant err-payout-failed (err u103))
(define-constant err-invalid-post (err u104))

;; Constants
(define-constant COST_PER_POST u100000) ;; 0.1 STX
(define-constant WIN_INTERVAL u10)
(define-constant PAYOUT_RATIO u90) ;; 90%
(define-constant MAX_MESSAGE_LENGTH u140)

;; Data Vars
(define-data-var counter uint u0)
(define-data-var total-stx-collected uint u0)
(define-data-var total-stx-paid uint u0)
(define-data-var last-jackpot-height uint u0)
(define-data-var last-jackpot-amount uint u0)
(define-data-var jackpot-count uint u0)

;; Maps
(define-map posts uint { 
    poster: principal, 
    message: (string-utf8 140),
    timestamp: uint,
    is-jackpot: bool,
    jackpot-amount: uint
})

;; Track user stats
(define-map user-stats-map
    { user: principal }
    {
        posts: uint,
        jackpots-won: uint,
        total-earned: uint,
        total-spent: uint,
        last-post: uint
    }
)

;; Track jackpot history
(define-map jackpot-history
    { jackpot-id: uint }
    {
        post-id: uint,
        winner: principal,
        amount: uint,
        block-height: uint,
        total-posts-at-time: uint
    }
)

;; Public Functions

(define-public (post-message (message (string-utf8 140)))
    (let (
        (current-count (var-get counter))
        (next-count (+ current-count u1))
        (sender tx-sender)
        (contract-addr (as-contract tx-sender))
        (pot-balance-before (stx-get-balance contract-addr))
        (user-data (default-to 
            { posts: u0, jackpots-won: u0, total-earned: u0, total-spent: u0, last-post: u0 }
            (map-get? user-stats-map { user: sender })
        ))
    )
        ;; Validate message length
        (asserts! (<= (len message) MAX_MESSAGE_LENGTH) err-msg-too-long)
        
        ;; 1. Collect Fee (1 STX)
        (unwrap! (stx-transfer? COST_PER_POST sender contract-addr) err-transfer-failed)
        
        ;; Update totals
        (var-set total-stx-collected (+ (var-get total-stx-collected) COST_PER_POST))
        
        ;; 2. Store Post
        (map-set posts next-count { 
            poster: sender, 
            message: message,
            timestamp: stacks-block-height,
            is-jackpot: false,
            jackpot-amount: u0
        })
        
        (var-set counter next-count)

        ;; Update user stats
        (map-set user-stats-map
            { user: sender }
            {
                posts: (+ (get posts user-data) u1),
                jackpots-won: (get jackpots-won user-data),
                total-earned: (get total-earned user-data),
                total-spent: (+ (get total-spent user-data) COST_PER_POST),
                last-post: stacks-block-height
            }
        )

        ;; Emit post created event
        (print {
            event: "post-created",
            post-id: next-count,
            poster: sender,
            message: message,
            timestamp: stacks-block-height,
            is-jackpot: false,
            total-posts: next-count
        })

        ;; 3. Check Jackpot Condition
        (if (is-eq (mod next-count WIN_INTERVAL) u0)
            (let (
                ;; Calculate Payout
                (pot-balance (stx-get-balance contract-addr))
                (payout (/ (* pot-balance PAYOUT_RATIO) u100))
                (remaining (- pot-balance payout))
                (jackpot-id (+ (var-get jackpot-count) u1))
            )
                ;; Validate payout
                (asserts! (> payout u0) err-payout-failed)
                
                ;; Payout Winner (sender)
                (try! (as-contract (stx-transfer? payout tx-sender sender)))
                
                ;; Update state
                (var-set total-stx-paid (+ (var-get total-stx-paid) payout))
                (var-set last-jackpot-height stacks-block-height)
                (var-set last-jackpot-amount payout)
                (var-set jackpot-count jackpot-id)
                
                ;; Update post to mark as jackpot
                (map-set posts next-count { 
                    poster: sender, 
                    message: message,
                    timestamp: stacks-block-height,
                    is-jackpot: true,
                    jackpot-amount: payout
                })
                
                ;; Get updated user data for winner
                (let ((winner-data (default-to 
                    { posts: u0, jackpots-won: u0, total-earned: u0, total-spent: u0, last-post: u0 }
                    (map-get? user-stats-map { user: sender })
                )))
                    ;; Update user stats for winner
                    (map-set user-stats-map
                        { user: sender }
                        {
                            posts: (get posts winner-data),
                            jackpots-won: (+ (get jackpots-won winner-data) u1),
                            total-earned: (+ (get total-earned winner-data) payout),
                            total-spent: (get total-spent winner-data),
                            last-post: stacks-block-height
                        }
                    )
                )
                
                ;; Record jackpot history
                (map-set jackpot-history
                    { jackpot-id: jackpot-id }
                    {
                        post-id: next-count,
                        winner: sender,
                        amount: payout,
                        block-height: stacks-block-height,
                        total-posts-at-time: next-count
                    }
                )
                
                ;; Emit jackpot won event
                (print { 
                    event: "jackpot-won", 
                    jackpot-id: jackpot-id,
                    post-id: next-count, 
                    winner: sender, 
                    amount: payout,
                    pot-before: pot-balance,
                    pot-after: remaining,
                    block-height: stacks-block-height,
                    is-jackpot: true 
                })
                
                ;; Emit pot updated event
                (print {
                    event: "pot-updated",
                    pot-balance: remaining,
                    last-jackpot: payout,
                    block-height: stacks-block-height
                })
                
                true
            )
            ;; Else: Just Log
            (begin
                (print { 
                    event: "new-post", 
                    post-id: next-count, 
                    poster: sender, 
                    message: message, 
                    pot-balance: (stx-get-balance contract-addr),
                    block-height: stacks-block-height,
                    is-jackpot: false 
                })
                true
            )
        )
        
        (ok next-count)
    )
)

;; Admin function to withdraw remaining pot (emergency only)
(define-public (emergency-withdraw (amount uint) (recipient principal))
    (begin
        (asserts! (is-eq tx-sender CONTRACT_OWNER) err-transfer-failed)
        (asserts! (> amount u0) err-invalid-post)
        (let ((contract-balance (stx-get-balance (as-contract tx-sender))))
            (asserts! (>= contract-balance amount) err-transfer-failed)
            (try! (as-contract (stx-transfer? amount tx-sender recipient)))
            
            (print {
                event: "emergency-withdrawal",
                amount: amount,
                recipient: recipient,
                remaining-balance: (- contract-balance amount),
                block-height: stacks-block-height,
                triggered-by: tx-sender
            })
            (ok true)
        )
    )
)

;; Read Only Functions

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

(define-read-only (get-user-stats (user principal))
    (default-to 
        { posts: u0, jackpots-won: u0, total-earned: u0, total-spent: u0, last-post: u0 }
        (map-get? user-stats-map { user: user })
    )
)

(define-read-only (get-jackpot-history (jackpot-id uint))
    (map-get? jackpot-history { jackpot-id: jackpot-id })
)

(define-read-only (get-last-jackpot)
    {
        block-height: (var-get last-jackpot-height),
        amount: (var-get last-jackpot-amount)
    }
)

(define-read-only (get-protocol-stats)
    {
        total-posts: (var-get counter),
        total-collected: (var-get total-stx-collected),
        total-paid: (var-get total-stx-paid),
        current-pot: (stx-get-balance (as-contract tx-sender)),
        jackpot-count: (var-get jackpot-count),
        last-jackpot-height: (var-get last-jackpot-height),
        last-jackpot-amount: (var-get last-jackpot-amount)
    }
)

(define-read-only (get-recent-posts (limit uint))
    ;; Note: Would need iteration - placeholder for frontend
    (ok { message: "Use get-post with specific IDs" })
)

(define-read-only (get-posts-by-user (user principal) (offset uint) (limit uint))
    ;; Note: Would need iteration - placeholder for frontend
    (ok { user: user, offset: offset, limit: limit })
)

;; Contract owner constant
(define-constant CONTRACT_OWNER tx-sender)
