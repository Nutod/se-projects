const fetch = require("node-fetch");

const {
  logTransactions,
  logErrors,
  logRefundFailure,
} = require("../lib/logger");
const { firestore, firebase } = require("../firebase");
const { fetchPlayerData } = require("./shared/fetchPlayerData");
const {
  recordWithdrawalTransactionUpdate,
} = require("./shared/recordWithdrawalTransactionUpdate");
const {
  recordDepositTransactionUpdate,
} = require("./shared/recordDepositTransactionUpdate");
const {
  recordDepositTransaction,
} = require("./shared/recordDepositTransaction");
const { recordRefundTransaction } = require("./shared/recordRefundTransaction");
const { savePaystackCard } = require("./shared/savePaystackCard");
const { savePaystackBankToken } = require("./shared/savePaystackBankToken");

exports.raveCtrl = async (req, res) => {
  //  Add the hash header here sometime soon
  if (req.body["event.type"] === "CARD_TRANSACTION") {
    console.log("Card Transaction");
    const { customer, txRef, amount, status, flwRef } = req.body;
    const phoneNumber = txRef.split("-")[0];
    console.log(phoneNumber);

    // Get the user with the phone number
    try {
      const response = await fetchPlayerData({ phoneNumber });
      const data = await response.json();

      // User the user info below
      if (Object.keys(data.scriptData).includes("PlayerData")) {
        // Get userId
        const userId = data.scriptData.PlayerData.PlayerID;

        if (status === "successful") {
          const updateBalanceResponse = await fetch(
            "https://Y376891fcBvk.live.gamesparks.net/rs/debug/ttumcFxf4f9enuSD1KeFxtXGmw8h2EMB/LogEventRequest",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({
                "@class": ".LogEventRequest",
                eventKey: "PLAYER_COINS_UPDATE",
                playerId: userId,
                CoinAmount: +amount,
                Operation: 1,
              }),
            }
          );

          const updateBalance = await updateBalanceResponse.json();
          // console.log(updateBalance);

          if (Object.keys(updateBalance).includes("scriptData")) {
            const gameTransactionId = updateBalance.scriptData.Result.TranID;

            const snapshot = await firestore
              .collection("new_deposits")
              .where("playerId", "==", userId)
              .where("refId", "==", txRef)
              .get();

            const data = snapshot.docs.map(doc => ({
              ...doc.data(),
              id: doc.id,
            }));
            const docId = data[0].id;

            await firestore.collection("new_deposits").doc(docId).update({
              status: "SUCCESSFUL",
              gameTransactionId,
              transaction_reference: flwRef,
            });

            await recordDepositTransactionUpdate({
              refId: txRef,
              transaction_reference: flwRef,
              gameTransactionId,
              status: "SUCCESSFUL",
            });

            logTransactions({
              channel: "Rave Card Transaction",
              status: "SUCCESSFUL",
              data: {
                ...req.body,
              },
            });

            return res.status(200).send("Complete");
          } else {
            const gameTransactionId = "MANUAL UPDATE REQUIRED";

            const snapshot = await firestore
              .collection("new_deposits")
              .where("playerId", "==", userId)
              .where("refId", "==", txRef)
              .get();

            const data = snapshot.docs.map(doc => ({
              ...doc.data(),
              id: doc.id,
            }));
            const docId = data[0].id;

            await firestore.collection("new_deposits").doc(docId).update({
              status: "SUCCESSFUL",
              gameTransactionId,
              transaction_reference: flwRef,
            });

            await recordDepositTransactionUpdate({
              refId: txRef,
              transaction_reference: flwRef,
              gameTransactionId,
              status: "SUCCESSFUL",
            });

            logTransactions({
              channel: "Rave Card Transaction",
              status: "SUCCESSFUL",
              data: {
                ...req.body,
              },
            });

            return res.status(200).send("Complete");
          }
        } else {
          // Failure Case
          const snapshot = await firestore
            .collection("new_deposits")
            .where("playerId", "==", userId)
            .where("refId", "==", txRef)
            .get();

          const data = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
          }));
          const docId = data[0].id;

          await firestore.collection("new_deposits").doc(docId).update({
            status: status.toUpperCase(),
            gameTransactionId: "--",
            transaction_reference: flwRef,
          });

          await recordDepositTransactionUpdate({
            refId: txRef,
            transaction_reference: flwRef,
            status: status.toUpperCase(),
          });

          logTransactions({
            channel: "Rave Card Transaction",
            status,
            data: {
              ...req.body,
            },
          });

          return res.status(200).send("Complete");
        }
      } else {
        return res.status(404).send("Not found");
      }
    } catch (err) {
      console.log(err);
      return res.status(404).send("Not found");
    }
  } else if (req.body["event.type"] === "Transfer") {
    const { transfer } = req.body;
    const { reference, status } = transfer;
    const phoneNumber = reference.split("-")[0];

    //1. Fetch the User Info with the Phone Number
    try {
      const response = await fetchPlayerData({ phoneNumber });
      const data = await response.json();

      // User info returned from the API call above used in this block
      if (Object.keys(data.scriptData).includes("PlayerData")) {
        // Get the userId
        const userId = data.scriptData.PlayerData.PlayerID;

        // Transfer Success case
        if (status === "SUCCESSFUL") {
          logTransactions({
            channel: "Rave Transfer",
            status: "SUCCESSFUL",
            data: {
              ...req.body,
            },
          });

          const snapshot = await firestore
            .collection("new_withdrawals")
            .where("playerId", "==", userId)
            .where("transaction_reference", "==", reference)
            .get();

          const data = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
          }));
          const docId = data[0].id;

          await firestore
            .collection("new_withdrawals")
            .doc(docId)
            .update({ status: "SUCCESSFUL" });

          // And then possibly try to update here
          await recordWithdrawalTransactionUpdate({
            reference,
            status: "SUCCESSFUL",
          });
        } else if (status === "FAILED") {
          logTransactions({
            channel: "Rave Transfer",
            status: "Failed",
            data: {
              ...req.body,
            },
          });

          const snapshot = await firestore
            .collection("new_withdrawals")
            .where("playerId", "==", userId)
            .where("transaction_reference", "==", reference)
            .get();

          const data = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
          }));
          const docId = data[0].id;

          if (data[0].status === "PENDING") {
            const ref = await firestore
              .collection("new_withdrawals")
              .doc(docId)
              .update({ status: "FAILED" });

            // Refund the user
            // Update the coin balance

            const updateBalanceResponse = await fetch(
              "https://Y376891fcBvk.live.gamesparks.net/rs/debug/ttumcFxf4f9enuSD1KeFxtXGmw8h2EMB/LogEventRequest",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
                },
                body: JSON.stringify({
                  "@class": ".LogEventRequest",
                  eventKey: "PLAYER_CASH_UPDATE",
                  playerId: userId,
                  RealAmount: Number(transfer.amount) + 50,
                  Operation: 1,
                }),
              }
            );

            const updateBalance = await updateBalanceResponse.json();

            if (Object.keys(updateBalance).includes("scriptData")) {
              await firestore.collection("new_refunds").add({
                amount: Number(transfer.amount) + 50,
                refund_date: new Date().toISOString(),
                paid_at: Date.now(),
                bank: transfer.bank_name,
                transaction_reference: reference,
                status: "SUCCESSFUL",
                time: firebase.firestore.FieldValue.serverTimestamp(),
                playerId: userId,
                gameTransactionId: updateBalance.scriptData.Result.TranID,
              });

              const response = await (
                await recordRefundTransaction({
                  amount: Number(transfer.amount) + 50,
                  phone_number: phoneNumber,
                  playerId: userId,
                  gameTransactionId: updateBalance.scriptData.Result.TranID,
                  status: "SUCCESSFUL",
                  reference,
                  bank: transfer.bank_name,
                })
              ).json();

              logRefundFailure({ ...response });
            } else {
              await firestore.collection("new_refunds").add({
                amount: Number(transfer.amount) + 50,
                refund_date: new Date().toISOString(),
                paid_at: Date.now(),
                bank: transfer.bank_name,
                transaction_reference: reference,
                status: "FAILED",
                time: firebase.firestore.FieldValue.serverTimestamp(),
                playerId: userId,
                gameTransactionId: "N/A",
              });

              const response = await (
                await recordRefundTransaction({
                  amount: Number(transfer.amount) + 50,
                  phone_number: phoneNumber,
                  playerId: userId,
                  status: "FAILED",
                  reference,
                  bank: transfer.bank_name,
                })
              ).json();

              const refundFailureObject = {
                ...updateBalance,
                PlayerID: userId,
                bank: transfer.bank_name,
                transaction_reference: reference,
                amount: Number(transfer.amount) + 50,
              };

              logRefundFailure({ ...response });
              logRefundFailure(refundFailureObject);
            }

            // And then possibly try to update here
            await recordWithdrawalTransactionUpdate({
              reference,
              status: "FAILED",
            });

            return res.status(200).send("Complete");
          } else {
            return res.status(200).send("Updated Already");
          }
        } else {
          return res.status(200);
        }
      }
    } catch (err) {
      // If no User, return 404
      console.log(err);
      logRefundFailure({
        error: err.name,
        message: err.message,
      });
      return res.status(404).send("Not found");
    }
  } else {
    const {
      customer,
      txRef,
      amount,
      status,
      charged_amount,
      createdAt,
      flwRef,
    } = req.body;
    const phoneNumber = txRef.split("-")[0];

    // Get the user with the phone number
    try {
      const response = await fetchPlayerData({ phoneNumber });
      const data = await response.json();

      // User the user info below
      if (Object.keys(data.scriptData).includes("PlayerData")) {
        // Get userId
        const userId = data.scriptData.PlayerData.PlayerID;

        // Success case
        if (status === "successful") {
          // Update the user coin balance

          const updateBalanceResponse = await fetch(
            "https://Y376891fcBvk.live.gamesparks.net/rs/debug/ttumcFxf4f9enuSD1KeFxtXGmw8h2EMB/LogEventRequest",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({
                "@class": ".LogEventRequest",
                eventKey: "PLAYER_COINS_UPDATE",
                playerId: userId,
                CoinAmount: Number(amount),
                Operation: 1,
              }),
            }
          );

          const updateBalance = await updateBalanceResponse.json();

          if (Object.keys(updateBalance).includes("scriptData")) {
            const gameTransactionId = updateBalance.scriptData.Result.TranID;
            logTransactions({
              channel: "Rave Instant Payment",
              status: "SUCCESSFUL",
              data: {
                ...req.body,
              },
            });

            await firestore.collection("new_deposits").add({
              amount: +amount,
              channel: "Instant Bank Transfer",
              deposit_date: new Date().toISOString(),
              paid_at: Date.now(),
              transaction_fees: Number(charged_amount) - Number(amount),
              transaction_reference: flwRef,
              status: "SUCCESSFUL",
              refId: txRef,
              gateway: "FLUTTERWAVE",
              customer_id: txRef.split("-")[0],
              gameTransactionId,
              time: firebase.firestore.FieldValue.serverTimestamp(),
              playerId: userId,
            });

            await recordDepositTransaction({
              amount,
              phone_number: txRef.split("-")[0],
              gateway: "Flutterwave",
              refId: txRef,
              playerId: userId,
              transaction_fees: Number(charged_amount) - Number(amount),
              status: "SUCCESSFUL",
              gameTransactionId,
              transaction_reference: flwRef,
              channel: "Instant Bank Transfer",
            });
          } else {
            const gameTransactionId = "MANUAL UPDATE REQUIRED";

            logTransactions({
              channel: "Rave Instant Payment",
              status: "SUCCESSFUL",
              data: {
                ...req.body,
              },
            });

            await firestore.collection("new_deposits").add({
              amount: +amount,
              channel: "Instant Bank Transfer",
              deposit_date: new Date().toISOString(),
              paid_at: Date.now(),
              transaction_fees: Number(charged_amount) - Number(amount),
              transaction_reference: flwRef,
              status: "SUCCESSFUL",
              refId: txRef,
              gateway: "FLUTTERWAVE",
              customer_id: txRef.split("-")[0],
              gameTransactionId,
              time: firebase.firestore.FieldValue.serverTimestamp(),
              playerId: userId,
            });

            await recordDepositTransaction({
              amount,
              phone_number: txRef.split("-")[0],
              gateway: "Flutterwave",
              refId: txRef,
              playerId: userId,
              transaction_fees: Number(charged_amount) - Number(amount),
              status: "SUCCESSFUL",
              gameTransactionId,
              transaction_reference: flwRef,
              channel: "Instant Bank Transfer",
            });
          }
        } else {
          logTransactions({
            channel: "Rave Instant Payment",
            status,
            data: {
              ...req.body,
            },
          });

          await firestore.collection("new_deposits").add({
            amount: +amount,
            channel: "Instant Bank Transfer",
            deposit_date: new Date().toISOString(),
            paid_at: Date.now(),
            transaction_fees: Number(charged_amount) - Number(amount),
            transaction_reference: flwRef,
            status: status.toUpperCase(),
            refId: txRef,
            gateway: "FLUTTERWAVE",
            customer_id: txRef.split("-")[0],
            gameTransactionId,
            time: firebase.firestore.FieldValue.serverTimestamp(),
            playerId: userId,
          });

          await recordDepositTransaction({
            amount,
            phone_number: txRef.split("-")[0],
            gateway: "Flutterwave",
            refId: txRef,
            playerId: userId,
            transaction_fees: Number(charged_amount) - Number(amount),
            status: "SUCCESSFUL",
            gameTransactionId,
            transaction_reference: flwRef,
            channel: "Instant Bank Transfer",
          });
        }
        return res.status(200).send("Complete");
      } else {
        return res.status(404).send("Not found");
      }
    } catch (err) {
      console.log(err);
      return res.status(404).send("Not found");
    }
  }
};

exports.paystackCtrl = async (req, res) => {
  const { data } = req.body;
  const { metadata, status, amount, authorization, reference } = data;
  const phoneNumber = metadata.phone;

  // Fetch the user details
  try {
    const response = await fetch(
      "https://Y376891fcBvk.live.gamesparks.net/rs/debug/ttumcFxf4f9enuSD1KeFxtXGmw8h2EMB/LogEventRequest",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          "@class": ".LogEventRequest",
          eventKey: "ANALYTICS_PLAYER_DATA_VIA_PHONE",
          playerId: "5ceab8bada4bd40515df67a0",
          PHONE_NUM: phoneNumber,
        }),
      }
    );
    const data = await response.json();

    if (Object.keys(data.scriptData).includes("PlayerData")) {
      // Get userId
      const userId = data.scriptData.PlayerData.PlayerID;

      const snapshot = await firestore
        .collection("test_deposits")
        .where("playerId", "==", userId)
        .where("refId", "==", metadata.refId)
        .get();

      const transactionData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id,
      }));

      if (
        transactionData.length === 1 &&
        transactionData[0].status === "PENDING"
      ) {
        if (status === "success") {
          const updateAmount = +amount / 100;
          let creditAmount = 0;

          if (updateAmount >= 2500) {
            creditAmount = updateAmount - 100;
          } else {
            creditAmount = updateAmount;
          }

          // Update the Coin Balance
          const updateBalanceResponse = await fetch(
            "https://Y376891fcBvk.live.gamesparks.net/rs/debug/ttumcFxf4f9enuSD1KeFxtXGmw8h2EMB/LogEventRequest",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({
                "@class": ".LogEventRequest",
                eventKey: "PLAYER_COINS_UPDATE",
                playerId: userId,
                CoinAmount: creditAmount,
                Operation: 1,
              }),
            }
          );

          const updateBalance = await updateBalanceResponse.json();

          if (Object.keys(updateBalance).includes("scriptData")) {
            const gameTransactionId = updateBalance.scriptData.Result.TranID;

            const docId = transactionData[0].id;

            await firestore.collection("test_deposits").doc(docId).update({
              status: "SUCCESSFUL",
              gameTransactionId,
              transaction_reference: reference,
            });

            await recordDepositTransactionUpdate({
              status: "SUCCESSFUL",
              gameTransactionId,
              transaction_reference: reference,
              refId: metadata.refId,
            });
          } else {
            const gameTransactionId = "MANUAL UPDATE REQUIRED";

            const snapshot = await firestore
              .collection("test_deposits")
              .where("playerId", "==", userId)
              .where("refId", "==", metadata.refId)
              .get();

            const data = snapshot.docs.map(doc => ({
              ...doc.data(),
              id: doc.id,
            }));
            const docId = data[0].id;

            await firestore.collection("test_deposits").doc(docId).update({
              status: "SUCCESSFUL",
              gameTransactionId,
              transaction_reference: reference,
            });

            await recordDepositTransactionUpdate({
              status: "SUCCESSFUL",
              gameTransactionId,
              transaction_reference: reference,
              refId: metadata.refId,
            });
          }

          logTransactions({
            channel: `Paystack ${
              authorization.channel === "card"
                ? "Card Transaction"
                : "Bank Transaction"
            }`,
            status: "SUCCESSFUL",
            data: {
              ...req.body.data,
              amount: creditAmount,
            },
          });

          // Save Credit Card
          if (authorization.channel === "card") {
            try {
              const snapshot = await firestore
                .collection("card_charge")
                .where("id", "==", userId)
                .get();

              const creditCards = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
              }));

              if (creditCards.length) {
                // Check if it exists already
                if (creditCards[0].data.length < 3) {
                  const cardExists = creditCards[0].data.filter(
                    card => card.last_digits === authorization.last4
                  );

                  if (cardExists.length) {
                  } else {
                    const docRef = await firestore
                      .collection("card_charge")
                      .doc(userId)
                      .update({
                        data: firebase.firestore.FieldValue.arrayUnion({
                          auth_code: authorization.authorization_code,
                          card_type: authorization.brand,
                          exp_month: authorization.exp_month,
                          exp_year: authorization.exp_year,
                          last_digits: authorization.last4,
                          cvv: metadata.cvv,
                        }),
                      });
                  }
                }
              } else {
                const docRef = await firestore
                  .collection("card_charge")
                  .doc(userId)
                  .set({
                    id: userId,
                    data: [
                      {
                        auth_code: authorization.authorization_code,
                        card_type: authorization.card_type,
                        exp_month: authorization.exp_month,
                        exp_year: authorization.exp_year,
                        last_digits: authorization.last4,
                        cvv: metadata.cvv,
                      },
                    ],
                  });
              }

              // TODO: Add Paystack Card here
              await savePaystackCard({
                auth_code: authorization.authorization_code,
                card_type: authorization.card_type,
                expiry_month: authorization.exp_month,
                expiry_year: authorization.exp_year,
                cvv: metadata.cvv,
                last_digits: authorization.last4,
                playerId: userId,
              });
            } catch (err) {}
          }

          // Save Bank Account
          if (authorization.channel === "bank") {
            try {
              const snapshot = await firestore
                .collection("bank_charge")
                .where("id", "==", userId)
                .get();

              const bankAccounts = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
              }));

              if (bankAccounts.length) {
                if (bankAccounts[0].data < 3) {
                  const accountExists = bankAccounts[0].data.filter(
                    account => account.last_digits === authorization.last4
                  );

                  if (accountExists.length) {
                  } else {
                    const docRef = await firestore
                      .collection("bank_charge")
                      .doc(userId)
                      .update({
                        data: firebase.firestore.FieldValue.arrayUnion({
                          auth_code: authorization.authorization_code,
                          bank: authorization.bank,
                          last_digits: authorization.last4,
                          account_number: metadata.account_number,
                          bank_code: metadata.bank_code,
                        }),
                      });
                  }
                } else {
                }
              } else {
                const docRef = await firestore
                  .collection("bank_charge")
                  .doc(userId)
                  .set({
                    id: userId,
                    data: [
                      {
                        auth_code: authorization.authorization_code,
                        bank: authorization.bank,
                        last_digits: authorization.last4,
                        account_number: metadata.account_number,
                        bank_code: metadata.bank_code,
                      },
                    ],
                  });
              }

              // TODO: Add Paystack Bank here
              await savePaystackBankToken({
                auth_code: authorization.auth_code,
                account_number: metadata.account_number,
                bank: authorization.bank,
                last_digits: authorization.last4,
                bank_code: metadata.bank_code,
                playerId: userId,
              });
            } catch (err) {}
          }
        } else {
          logTransactions({
            channel: `Paystack ${
              authorization.channel === "card"
                ? "Card Transaction"
                : "Bank Transaction"
            }`,
            status,
            data: {
              ...req.body.data,
              amount: creditAmount,
            },
          });

          const snapshot = await firestore
            .collection("test_deposits")
            .where("playerId", "==", userId)
            .where("refId", "==", metadata.refId)
            .get();

          const data = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
          }));
          const docId = data[0].id;

          const ref = await firestore
            .collection("test_deposits")
            .doc(docId)
            .update({ status: status.toUpperCase() });

          await recordDepositTransactionUpdate({
            status: status.toUpperCase(),
            transaction_reference: reference,
            refId: metadata.refId,
          });
        }

        return res.status(200).send("Complete");
      } else if (
        transactionData.length === 1 &&
        transactionData[0].status === "SUCCESSFUL"
      ) {
        return res.status(200).send("Transaction up to date");
      } else {
        return res.status(200).send("No record Found");
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(404).send("Not found");
  }
};
