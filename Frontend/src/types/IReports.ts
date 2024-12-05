interface answer {
    count: number;
    answer: string;
}

interface Survey {
    count: number;
    question: string;
    answers: answer[]
}

interface Msg {
    count: number;
    qoute: string;
}


export interface IReport {
    name: string;
    scented: number;
    unscented: number;
    success: number;
    failed: number;
    surveys: Survey[];
    env: Msg[];
}
