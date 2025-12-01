<template>
	<div>
        <v-card :style="`${cardClass}`" v-if="passedObject.panelMMPrefix" :key="'mmVal' + passedObject.panelMMPrefix + passedObject.panelID + passedObject.panelHSize + passedObject.panelWSize" :flat="passedObject.borderless" :height="passedObject.panelHSize" :width="passedObject.panelWSize" :color="panelBackgroundColor" style="height: 100%; width: 100%">
		<v-row align="center" style="height: 100%; width: 100%" class="pa-0 ma-0">
			<v-card-text v-if="passedObject.panelMMOrientation == 'V'" class="text-center pa-0 ma-0" align="center">
				<v-row v-if="passedObject.inputIconAbove && passedObject.inputIconAbove.startsWith('mdi-')" justify="center" align="center" class="d-flex pa-0 ma-0">
					<v-col cols="12" justify="center">
						<v-layout column align-center><span justify="center"><v-icon :size="passedObject.inputIconAboveSize" :color="passedObject.inputIconAboveColor">{{ passedObject.inputIconAbove }}</v-icon></span></v-layout>
					</v-col>
				</v-row>
				<v-row dense>
					<v-col class="d-flex flex-column pa-0 ma-0">
						<strong :style="'color: ' + passedObject.panelMMPrefixColor" :class="`text-${passedObject.panelMMTextSize}`">
							{{ passedObject.panelMMPrefix }}
						</strong>
					</v-col>
				</v-row>
				<v-row v-if="passedObject.panelType == 'mmValue'" dense>
					<v-col class="d-flex flex-column pa-0 ma-0">
						<span :style="'color: ' + passedObject.panelMMValueColor" :class="`text-${passedObject.panelMMTextSize}`">
							{{ matchedMMVal }}
						</span>
					</v-col>
				</v-row>
			</v-card-text>
			<v-card-text v-else class="text-center pa-0 ma-0">
				<v-row v-if="passedObject.inputIconAbove && passedObject.inputIconAbove.startsWith('mdi-')" justify="center" align="center" class="d-flex pa-0 ma-0">
					<v-col cols="12" justify="center">
						<v-layout column align-center><span justify="center"><v-icon :size="passedObject.inputIconAboveSize" :color="passedObject.inputIconAboveColor">{{ passedObject.inputIconAbove }}</v-icon></span></v-layout>
					</v-col>
				</v-row>
				<v-row dense justify="center" align="center">
					<v-col class="d-flex flex-column pa-0 ma-0" justify="center" align="center">
						<strong :style="'color: ' + passedObject.panelMMPrefixColor" :class="`text-${passedObject.panelMMTextSize}`" justify="center" align="center">
							{{ passedObject.panelMMPrefix }}
						</strong>
					</v-col>
					<v-col v-if="passedObject.panelType == 'mmValue'" class="d-flex flex-column pa-0 ma-0">
						<span :style="'color: ' + passedObject.panelMMValueColor" :class="`text-${passedObject.panelMMTextSize}`">
							{{ matchedMMVal }}
						</span>
					</v-col>
				</v-row>
			</v-card-text>
		</v-row>
	</v-card>
        <v-card :style="`${cardClass}`" v-else :key="'mmVal' + passedObject.panelMMPrefix + passedObject.panelID + passedObject.panelHSize + passedObject.panelWSize" :flat="passedObject.borderless" :height="passedObject.panelHSize" :width="passedObject.panelWSize" :color="panelBackgroundColor" style="height: 100%; width: 100%">
		<v-row align="center" style="height: 100%; width: 100%" class="pa-0 ma-0">
			<v-card-text v-if="passedObject.panelMMOrientation == 'V'" class="text-center pa-0 ma-0" align="center">
				<v-row v-if="passedObject.inputIconAbove && passedObject.inputIconAbove.startsWith('mdi-')" justify="center" align="center" class="d-flex pa-0 ma-0">
					<v-col cols="12" justify="center">
						<v-layout column align-center><span justify="center"><v-icon :size="passedObject.inputIconAboveSize" :color="passedObject.inputIconAboveColor">{{ passedObject.inputIconAbove }}</v-icon></span></v-layout>
					</v-col>
				</v-row>
				<v-row v-if="passedObject.panelType == 'mmValue'" dense>
					<v-col class="d-flex flex-column pa-0 ma-0">
						<span :style="'color: ' + passedObject.panelMMValueColor" :class="`text-${passedObject.panelMMTextSize}`">
							{{ matchedMMVal }}
						</span>
					</v-col>
				</v-row>
			</v-card-text>
			<v-card-text v-else class="text-center pa-0 ma-0">
				<v-row v-if="passedObject.inputIconAbove && passedObject.inputIconAbove.startsWith('mdi-')" justify="center" align="center" class="d-flex pa-0 ma-0">
					<v-col cols="12" justify="center">
						<v-layout column align-center><span justify="center"><v-icon :size="passedObject.inputIconAboveSize" :color="passedObject.inputIconAboveColor">{{ passedObject.inputIconAbove }}</v-icon></span></v-layout>
					</v-col>
				</v-row>
				<v-row dense>
					<v-col v-if="passedObject.panelType == 'mmValue'" class="d-flex flex-column pa-0 ma-0">
						<span :style="'color: ' + passedObject.panelMMValueColor" :class="`text-${passedObject.panelMMTextSize}`">
							{{ matchedMMVal }}
						</span>
					</v-col>
				</v-row>
			</v-card-text>
		</v-row>
	</v-card>
	</div>		
</template>

<script>
import jsonpath from 'jsonpath';
import store from "@/store";
import { evaluate } from 'mathjs'


export default {
	props: {
		passedObject: {
			type: Object
		}
    },
        computed: {
                matchedMMVal() {return this.getModelValue();},
                cardClass() {
                        if(!this.passedObject.inputIconAbove.startsWith('mdi-')){
                                return `background-image: url('${this.passedObject.inputIconAbove}'); background-size: cover;`;
                        }else {
                                return '';
                        }
                },
                panelBackgroundColor() {
                        //Determine the appropriate background colour. If dynamic colouring is disabled or invalid, fall back to the static panel colour.
                        const baseColor = this.passedObject.panelColor;
                        if(!this.passedObject.panelDynamicBGEnabled || this.passedObject.panelDynamicBGMode === 'Static'){
                                return baseColor;
                        }

                        if(this.passedObject.panelDynamicBGMode === 'Boolean'){
                                return this.getBooleanBackgroundColor(this.matchedMMVal, baseColor);
                        }

                        if(this.passedObject.panelDynamicBGMode === 'Numeric'){
                                return this.getNumericBackgroundColor(this.matchedMMVal, baseColor);
                        }
                        return baseColor;
                }
        },
        methods: {
                getModelValue(){
			const jp = jsonpath;
			if(this.passedObject.panelMMPath){
				if(this.passedObject.panelMMPath.startsWith("global.")){
					let tmpStr = this.passedObject.panelMMPath.replace("global.", "");
					let tmpNum = null;
					let tmpArr = null;
					//detect if this is a global variable array and retrieve the array value - dwc 3.5
					tmpArr = tmpStr.match(/(?<=\[)[0-9]+?(?=\])/g);
					if(tmpArr){
						tmpNum = Number(tmpArr[0]);
						tmpStr = tmpStr.replace(/\[.*\]/g, "");
						if(store.state.machine.model.global.has(tmpStr)){
							let globArr = store.state.machine.model.global.get(tmpStr);
							if(!isNaN(globArr[tmpNum]) && this.passedObject.panelMMEvalMathStr.length > 0){
								let tmpMathStr3 = this.passedObject.panelMMEvalMathStr.replace("##VALUE##", globArr[tmpNum]);
								try{
									let tmpRet3 = evaluate(tmpMathStr3);
									return tmpRet3;
								}catch{
									return "#Invalid Expression#"
								}
							}else{
								return globArr[tmpNum];
							}
						}else{
							return "###";
						}
					}
					if(store.state.machine.model.global.has(tmpStr)){
						let tmpVal = store.state.machine.model.global.get(tmpStr)
						if(!isNaN(tmpVal) && this.passedObject.panelMMEvalMathStr.length > 0){
							let tmpMathStr = this.passedObject.panelMMEvalMathStr.replace("##VALUE##", tmpVal);
							try{
								let tmpRet = evaluate(tmpMathStr);
								return tmpRet;
							}catch{
								return "#Invalid Expression#"
							}
						}else{
							return tmpVal;
						}
					}else{
						return "###";
					}
				}else if(this.passedObject.panelMMPath.startsWith("plugins.")){
					return "plugins Object cannot be used here";
				}else{
					var matchInModel = jp.query(store.state.machine.model, (`$.${this.passedObject.panelMMPath}`));
					if(JSON.stringify(matchInModel) != "[]"){
						let tmpVal2 = matchInModel[0];
						if(!isNaN(tmpVal2) && this.passedObject.panelMMEvalMathStr.length > 0){
							let tmpMathStr2 = this.passedObject.panelMMEvalMathStr.replace("##VALUE##", tmpVal2);
							try{
								let tmpRet2 = evaluate(tmpMathStr2);
								return tmpRet2;
							}catch{
								return "#Invalid Expression#"
							}
						}else{
							return tmpVal2;
						}
					}else{
						return "###";
					}
				}
			}else {
				return "###";
			}		
                },
                parseColor(colString){
                        //Converts a hex colour string into rgba components. Returns null if parsing fails.
                        if(!colString || typeof colString !== 'string'){
                                return null;
                        }
                        const hex = colString.replace('#','');
                        if(!(hex.length === 6 || hex.length === 8)){
                                return null;
                        }
                        const hasAlpha = hex.length === 8;
                        try{
                                const r = parseInt(hex.substring(0,2),16);
                                const g = parseInt(hex.substring(2,4),16);
                                const b = parseInt(hex.substring(4,6),16);
                                const a = hasAlpha ? parseInt(hex.substring(6,8),16)/255 : 1;
                                if([r,g,b,a].some(val => isNaN(val))){
                                        return null;
                                }
                                return {r,g,b,a};
                        }catch{
                                return null;
                        }
                },
                toRGBAString(colObj){
                        return `rgba(${colObj.r}, ${colObj.g}, ${colObj.b}, ${colObj.a})`;
                },
                interpolateColour(col1, col2, factor){
                        //Linearly interpolates two colours using factor between 0 and 1.
                        const inv = 1 - factor;
                        return {
                                r: Math.round(col1.r * inv + col2.r * factor),
                                g: Math.round(col1.g * inv + col2.g * factor),
                                b: Math.round(col1.b * inv + col2.b * factor),
                                a: col1.a * inv + col2.a * factor
                        };
                },
                getBooleanBackgroundColor(val, fallback){
                        //Uses the configured colours for boolean values. Only 0/false and 1/true trigger a change; other values fall back.
                        const zeroCol = this.parseColor(this.passedObject.panelDynamicBGBooleanZeroColor);
                        const oneCol = this.parseColor(this.passedObject.panelDynamicBGBooleanOneColor);
                        const isZero = val === false || val === 0 || val === '0';
                        const isOne = val === true || val === 1 || val === '1';
                        if(isZero && zeroCol){
                                return this.toRGBAString(zeroCol);
                        }
                        if(isOne && oneCol){
                                return this.toRGBAString(oneCol);
                        }
                        return fallback;
                },
                getNumericBackgroundColor(val, fallback){
                        //Generates a 3-colour gradient based on configured thresholds. Invalid inputs fall back to the static colour.
                        const numVal = Number(val);
                        if(isNaN(numVal)){
                                return fallback;
                        }

                        const minVal = Number(this.passedObject.panelDynamicBGMinValue);
                        const midVal = Number(this.passedObject.panelDynamicBGMidValue);
                        const maxVal = Number(this.passedObject.panelDynamicBGMaxValue);

                        const minCol = this.parseColor(this.passedObject.panelDynamicBGMinColor);
                        const midCol = this.parseColor(this.passedObject.panelDynamicBGMidColor);
                        const maxCol = this.parseColor(this.passedObject.panelDynamicBGMaxColor);

                        if([minVal, midVal, maxVal].some(v => isNaN(v)) || !minCol || !midCol || !maxCol){
                                return fallback;
                        }

                        if(numVal <= minVal){
                                return this.toRGBAString(minCol);
                        }
                        if(numVal >= maxVal){
                                return this.toRGBAString(maxCol);
                        }

                        if(numVal <= midVal){
                                const range = midVal - minVal;
                                const factor = range === 0 ? 0 : (numVal - minVal) / range;
                                const col = this.interpolateColour(minCol, midCol, factor);
                                return this.toRGBAString(col);
                        }

                        const range = maxVal - midVal;
                        const factor = range === 0 ? 0 : (numVal - midVal) / range;
                        const col = this.interpolateColour(midCol, maxCol, factor);
                        return this.toRGBAString(col);
                }
        }
}
</script>
