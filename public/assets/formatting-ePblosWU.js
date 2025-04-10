function e(n){const r=Number(n);return Number.isNaN(r)?"£NaN":new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(r)}export{e as f};
