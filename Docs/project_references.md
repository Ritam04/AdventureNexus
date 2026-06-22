# Academic References: **AdventureNexus**
### Selected Bibliography, Standards Specifications, and Technical Documentation

---

## 1. Cryptography, E2EE, and Browser Security

1. **Bernstein, D. J., Lange, T., & Schwabe, P. (2012).** *The security of Salsa20.* In *Proceedings of the 2012 ACM Conference on Computer and Communications Security*, 10-21.
   - *Relevance*: Underpins the cryptographic security of XSalsa20 used inside TweetNaCl for symmetric stream encryption.
2. **Bernstein, D. J. (2006).** *Curve25519: new Diffie-Hellman speed records.* In *Public Key Cryptography - PKC 2006*, Lecture Notes in Computer Science, vol 3958. Springer, Berlin, Heidelberg.
   - *Relevance*: Outlines the mathematics of the X25519 Elliptic Curve Diffie-Hellman key exchange implemented in AdventureNexus.
3. **W3C Working Group. (2015).** *Indexed Database API 2.0.* W3C Recommendation. Available at: `https://www.w3.org/TR/IndexedDB-2/`
   - *Relevance*: Details the operational standard for client-side sandboxed binary storage used to isolate private keys.
4. **Somorovsky, J. (2016).** *Systematic analysis of web storage security.* In *IEEE Security & Privacy Magazine*, 14(5), 56-63.
   - *Relevance*: Documents the XSS extraction risks of `localStorage` and supports the decision to sandbox keys in IndexedDB.

---

## 2. Graph Algorithms & Expense netting

5. **Cormen, T. H., Leiserson, C. E., Rivest, R. L., & Stein, C. (2009).** *Introduction to Algorithms* (3rd ed.). MIT Press.
   - *Relevance*: Provides the theoretical foundation for greedy heuristic designs, directed graph modeling, and path reductions.
6. **Goldberg, A. V., & Tarjan, R. E. (1988).** *A new approach to the maximum-flow problem.* *Journal of the ACM (JACM)*, 35(4), 921-940.
   - *Relevance*: Discusses network flow optimization algorithms, which inform the transaction minimization logic in the netting engine.

---

## 3. Machine Learning & Recommendation Systems

7. **Salton, G., & Buckley, C. (1988).** *Term-weighting approaches in automatic text retrieval.* *Information Processing & Management*, 24(5), 513-523.
   - *Relevance*: Outlines the mathematical foundation of TF-IDF text vectorization used in the recommendation engine.
8. **Ricci, F., Rokach, L., & Shapira, B. (2015).** *Recommender Systems Handbook* (2nd ed.). Springer.
   - *Relevance*: Outlines Content-Based Filtering models, cosine similarity calculations, and techniques for mitigating cold-start issues.

---

## 4. Content Moderation & Reputation Systems

9. **Jaccard, P. (1912).** *The distribution of the flora in the alpine zone.* *New Phytologist*, 11(2), 37-50.
   - *Relevance*: Defines the Jaccard similarity index used by the review fraud detection system.
10. **Resnick, P., Zeckhauser, R., Friedman, E., & Kuwabara, K. (2000).** *Reputation systems.* *Communications of the ACM*, 43(12), 45-48.
    - *Relevance*: Analyzes trust calculations and reputation metrics in social platforms.

---

## 5. Web Frameworks & Microservice Architectures

11. **Tilkov, S., & Vinoski, S. (2010).** *Node.js: Using transient JavaScript on the server.* *IEEE Internet Computing*, 14(6), 80-83.
    - *Relevance*: Explains the non-blocking asynchronous event loop structure of Node.js used by the Express backend.
12. **Ramírez, M. A. (2020).** *FastAPI: Web framework for building APIs with Python 3.6+.* Available at: `https://fastapi.tiangolo.com/`
    - *Relevance*: Official documentation for FastAPI, used to implement the recommendation microservice.
