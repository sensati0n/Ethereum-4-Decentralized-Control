export const TASKTYPES = [
    { key: 0, text: "TASK", value: 0 },
    { key: 1, text: "AND", value: 1 },
    { key: 2, text: "OR", value: 2 },
    { key: 3, text: "XOR", value: 3 }
];

export const DECISIONOPTIONS = [
    { key: 0, text: "String Decision", value: 0 },
    { key: 1, text: "Integer Decision", value: 1 },
];

export const OPERATOROPTIONS = [
    { key: 0, text: "<", value: 0 },
    { key: 1, text: ">", value: 1 },
    { key: 2, text: "==", value: 2 },
    { key: 3, text: "!=", value: 3 },
    { key: 4, text: "<=", value: 4 },
    { key: 5, text: ">=", value: 5 }
];

export const OPERATORTYPES_INT =
{
    0: "<",
    1: ">",
    2: "==",
    3: "!=",
    4: "<=",
    5: ">=",
    6: "in"
}


export const GATEWAYOPTIONS = [
    { key: 0, text: "Databased Exclusive", value: 0 },
    { key: 1, text: "Databased Inclusive", value: 1 }
];

export const GATEWAYTYPES = { DBEXCL: 0, DBINCL: 1 };
export const GATEWAYTYPES_INT = { 0: "DBEXCL", 1: "DBINCL" };

export const DECISIONTYPES = { STRDESC: 0, INTDESC: 1 };
export const DECISIONTYPES_INT = { 0: "STRDESC", 1: "INTDESC" };