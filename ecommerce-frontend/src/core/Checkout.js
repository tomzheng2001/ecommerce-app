import React, { useEffect, useState } from "react";
import { getBraintreeClientToken, processPayment } from "./apiCore";
import { isAuthenticated } from "../admin/apiAdmin";
import { Link } from "react-router-dom";
import DropIn from "braintree-web-drop-in-react";
import { emptyCart } from "./cartHelpers";

const Checkout = ({ products }) => {
    const [data, setData] = useState({
        success: false,
        clientToken: null,
        error: "",
        instance: {},
        address: "",
    });

    const userId = isAuthenticated() && isAuthenticated().user._id;
    const token = isAuthenticated() && isAuthenticated().token;

    const getToken = (userId, token) => {
        getBraintreeClientToken(userId, token).then((response) => {
            if (response.error) {
                setData({ ...data, error: response.error });
            } else {
                setData({ clientToken: response.clientToken });
            }
        });
    };

    useEffect(() => {
        getToken(userId, token);
    }, []);

    const showCheckout = () =>
        isAuthenticated() ? (
            <div>{showDropIn()}</div>
        ) : (
            <Link to="/signin">
                <button className="btn btn-primary">Sign in to checkout</button>
            </Link>
        );

    const getTotal = () => {
        return products.reduce((currentValue, nextValue) => {
            return currentValue + nextValue.count * nextValue.price;
        }, 0);
    };

    const buy = () => {
        if (!data.instance) {
            console.log("Not valid");
            return;
        }

        let getNonce = data.instance
            .requestPaymentMethod()
            .then((data) => {
                // console.log(data);
                let nonce = data.nonce;
                //
                const paymentData = {
                    paymentMethodNonce: nonce,
                    amount: getTotal(products),
                };

                processPayment(userId, token, paymentData)
                    .then((response) => {
                        setData({ ...data, success: response.success });
                        emptyCart(() => {
                            console.log("payment successful");
                        });
                    })
                    .catch((error) => console.log(error));
            })
            .catch((error) => {
                console.log("dropin error:", error);
                setData({ ...data, error: error.message });
            });
    };

    const showDropIn = () => {
        return (
            <div onBlur={() => setData({ ...data, error: "" })}>
                {data.clientToken !== null && products.length > 0 ? (
                    <div>
                        <DropIn
                            options={{
                                authorization: data.clientToken,
                                paypal: {
                                    flow: "vault",
                                },
                            }}
                            onInstance={(instance) =>
                                (data.instance = instance)
                            }
                        />
                        <button onClick={buy} className="btn btn-success">
                            Pay
                        </button>
                    </div>
                ) : null}
            </div>
        );
    };

    const showError = (error) => {
        return (
            <div
                className="alert alert-danger"
                style={{ display: error ? "" : "none" }}
            >
                {error}
            </div>
        );
    };

    const showSuccess = (success) => {
        return (
            <div
                className="alert alert-info"
                style={{ display: success ? "" : "none" }}
            >
                Thanks! Your payment was successful!
            </div>
        );
    };

    return (
        <div>
            <h2>Total: ${getTotal()}</h2>
            {showSuccess(data.success)}
            {showError(data.error)}
            {showCheckout()}
        </div>
    );
};

export default Checkout;
