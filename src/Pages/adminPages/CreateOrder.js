import React from "react";
import styles from "./CreateOrder.module.css";
import { StudentList } from "./createOrderPages/StudentList";
import { OrderList } from "./createOrderPages/OrderList";
import TopHeading from "../../Components/TopHeading/TopHeading";

export const CreateOrder = () => {

  return (
    <React.Fragment>

      <TopHeading>Jobs & Requests</TopHeading>
      


      <div className={styles.dashboardContainer} >

      

        <StudentList />

      <OrderList />

      </div>

    </React.Fragment>
  );
};
