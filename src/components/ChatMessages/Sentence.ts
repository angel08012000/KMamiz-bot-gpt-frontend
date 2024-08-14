type UI = TextUI | ImageUI | LinkUI | CodeUI | TableUI | ButtonUI;

type TextUI = {
    content: string;
};

type ImageUI = {
    src: string;
    alt?: string;
};

type LinkUI = {
    href: string;
    content: string;
}

type CodeUI = {
    language: string;
    content: string;
}

type TableUI = {
    thead?: string;
    tbody: string;
    tfoot?: string;
}

type ButtonUI = {
    function?: string;
    content: string;
}

function getContent(type: string, ui: UI){
    switch(type){
    }
}