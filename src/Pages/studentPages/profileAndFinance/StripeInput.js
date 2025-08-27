import React, { forwardRef, useState, useImperativeHandle } from "react";
import { alpha, useTheme } from "@mui/material/styles";

const StripeInput = forwardRef((props, ref) => {
  const { component: Component, options, ...other } = props;
  const theme = useTheme();
  const [mountNode, setMountNode] = useState(null);

  useImperativeHandle(
    ref,
    () => ({
      focus: () => mountNode.focus()
    }),
    [mountNode]
  );

  return (
    <Component
      onReady={setMountNode}
      options={{
        ...options,
        style: {
          base: {
            color: theme.palette.text.primary,
            fontSize: "16px",
            fontFamily: theme.typography.fontFamily,
            "::placeholder": {
              color: alpha(theme.palette.text.primary, 0.42)
            }
          },
          invalid: {
            color: theme.palette.text.primary
          }
        }
      }}
      {...other}
    />
  );
});

export default StripeInput;
