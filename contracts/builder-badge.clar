;; Builder Badge NFT
;; =========================================================================
;; A SIP-009 compliant NFT demonstrating Clarity 4 features.
;; Uses `int-to-ascii` for dynamic token URIs.

(impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

;; =========================================================================
;; CONSTANTS
;; =========================================================================

(define-constant CONTRACT_OWNER tx-sender)
(define-constant MINT_PRICE u5000000) ;; 5 STX
(define-constant MAX_SUPPLY u1000)

(define-constant ERR_NOT_AUTHORIZED (err u100))
(define-constant ERR_SOLD_OUT (err u101))
(define-constant ERR_INSUFFICIENT_FUNDS (err u102))
(define-constant ERR_NOT_TOKEN_OWNER (err u103))

;; =========================================================================
;; DATA VARS & MAPS
;; =========================================================================

(define-non-fungible-token builder-badge uint)

(define-data-var last-token-id uint u0)
(define-data-var base-uri (string-ascii 100) "https://api.badges.xyz/token/")

;; =========================================================================
;; SIP-009 STANDARD FUNCTIONS
;; =========================================================================

(define-read-only (get-last-token-id)
  (ok (var-get last-token-id))
)

(define-read-only (get-token-uri (token-id uint))
  (ok (some (concat 
    (var-get base-uri)
    (concat (int-to-ascii token-id) ".json")
  )))
)

(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? builder-badge token-id))
)

(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) ERR_NOT_TOKEN_OWNER)
    (nft-transfer? builder-badge token-id sender recipient)
  )
)

;; =========================================================================
;; MINT FUNCTION
;; =========================================================================

(define-public (mint)
  (let (
    (next-id (+ (var-get last-token-id) u1))
    (buyer tx-sender)
  )
    ;; Check supply
    (asserts! (<= next-id MAX_SUPPLY) ERR_SOLD_OUT)
    
    ;; Pay mint fee
    (try! (stx-transfer? MINT_PRICE buyer CONTRACT_OWNER))
    
    ;; Mint NFT
    (try! (nft-mint? builder-badge next-id buyer))
    
    ;; Update state
    (var-set last-token-id next-id)
    
    (print {
      event: "mint",
      token-id: next-id,
      buyer: buyer,
      price: MINT_PRICE
    })
    
    (ok next-id)
  )
)

;; =========================================================================
;; ADMIN FUNCTIONS
;; =========================================================================

(define-public (set-base-uri (new-uri (string-ascii 100)))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (var-set base-uri new-uri)
    (ok true)
  )
)
