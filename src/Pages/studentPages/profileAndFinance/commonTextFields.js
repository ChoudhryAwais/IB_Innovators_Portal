import React from "react";
import {
  AuBankAccountElement,
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  FpxBankElement,
  IbanElement,
  IdealBankElement
} from "@stripe/react-stripe-js";
import TextField from "@mui/material/TextField";
import StripeInput from "./StripeInput";

const StripeTextField = (props) => {
  const {
    helperText,
    InputLabelProps,
    InputProps = {},
    inputProps,
    error,
    labelErrorMessage,
    stripeElement,
    ...other
  } = props;

  return (
    <TextField
      fullWidth
      InputLabelProps={{
        ...InputLabelProps,
        shrink: true
      }}
      error={error}
      InputProps={{
        ...InputProps,
        inputProps: {
          ...inputProps,
          ...InputProps.inputProps,
          component: stripeElement
        },
        inputComponent: StripeInput
      }}
      helperText={error ? labelErrorMessage : helperText}
      {...(other)}
    />
  );
};

const StripeTextFieldNumber = (props) => {
  return (
    <StripeTextField
      label="Credit Card Number"
      stripeElement={CardNumberElement}
      {...props}
    />
  );
};

const StripeTextFieldExpiry = (props) => {
  return (
    <StripeTextField
      label="Expires"
      stripeElement={CardExpiryElement}
      {...props}
    />
  );
};

const StripeTextFieldCVC = (props) => {
  return (
    <StripeTextField
      label="CVC Code"
      stripeElement={CardCvcElement}
      {...props}
    />
  );
};

export { StripeTextField, StripeTextFieldNumber, StripeTextFieldExpiry, StripeTextFieldCVC };
