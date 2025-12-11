<style scoped>
        .switch-center {
                display: flex;
                justify-content: center;
        }

        /* Hide the default circular thumb for the custom vertical slider */
		:deep(.vertical-slider .v-slider__thumb),
		:deep(.vertical-slider .v-slider__thumb:before) {
		  box-shadow: none;
		  border: none;
		  background: transparent;
		}
		
		/* Make the label a centered rectangle on the track */
		:deep(.vertical-slider .v-slider__thumb-label) {
  		top: 50%;
  		left: 50%;
  		transform: translate(-50%, -50%) !important;
  		border-radius: 4px;
  		background-color: #2196f3;  /* or your color */
 		 box-shadow: none;

  		/* NEW: let the box grow with the text */
  		display: flex;
  		align-items: center;
 		justify-content: center;
 		padding: 4px 10px;       /* a bit more horizontal padding */
  		min-width: 60px;         /* enough for "100 %" etc. */
  		height: auto;
		}
		
		/* Remove the little triangle pointer */
		:deep(.vertical-slider .v-slider__thumb-label::before) {
		  display: none;
		}
		
		/* Un-rotate any text/content inside the label */
		:deep(.vertical-slider .v-slider__thumb-label span),
		:deep(.vertical-slider .v-slider__thumb-label__content),
		:deep(.vertical-slider .v-slider__thumb-label > *) {
		  transform: none !important;
		  display: flex;
		  align-items: center;
		  justify-content: center;
		  white-space: nowrap;
		  line-height: 1.2;
		}

        .vertical-slider-wrapper {
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
        }

        .-card {
                display: flex;
                align-items: center;
                justify-content: center;
                flex-direction: column;
                height: 100%;
                width: 140px !important;
                min-width: 140px;
                max-width: 180px;
                margin: 0 auto;
        }

        . {
                height: 100%;
        }

        .borderless-card {
                border: none !important;
                box-shadow: none !important;
        }

        :deep(. .v-slider__thumb),
        :deep(. .v-slider__thumb:before) {
                box-shadow: none;
                border: none;
                background: transparent;
                width: 0;
                height: 0;
        }
</style>

<template>
        <div>
                <v-card :id="`gip-${passedObject.panelID}`" :class="['pa-1 ma-0', { '-card': isVerticalSlider, 'borderless-card': passedObject.borderless }]" :key="'vInput' + passedObject.inputPrefixText + passedObject.inputSuffixText + passedObject.inputVarName + passedObject.panelID + passedObject.panelHSize + passedObject.panelWSize" :flat="passedObject.borderless" :height="passedObject.panelHSize" :width="isVerticalSlider ? (passedObject.panelWSize || 140) : passedObject.panelWSize" :color="passedObject.panelColor" :style="isVerticalSlider ? 'height: 100%; max-width: 80px; margin: 0 auto;' : 'height: 100%; width: 100%;'">
			<v-row align="center" style="height: 98%; width: 98%" class="pa-0 ma-0">
				<v-card-text class="text-center pa-0 ma-0">
                                        <v-row v-if="passedObject.inputIconAbove && !isSliderDisp && passedObject.inputType != 'boolean'" justify="center" align="center" class="d-flex pa-0 ma-0">
                                                <v-col cols="12" justify="center">
                                                        <v-layout column align-center><span justify="center"><v-icon :size="passedObject.inputIconAboveSize" :color="passedObject.inputIconAboveColor">{{ passedObject.inputIconAbove }}</v-icon></span></v-layout>
                                                </v-col>
                                        </v-row>
                                        <v-row v-if="isHorizontalSlider" dense justify="center" align="center">
                                                <v-col class="d-flex flex-column pa-0 ma-0" justify="center" align="center" cols="10">
                                                        <v-row v-if="passedObject.inputIconAbove" justify="center" align="center" class="d-flex pa-0 ma-0 mt-n16">
                                                                <v-col cols="12" justify="center">
									<v-layout column align-center><span justify="center"><v-icon :size="passedObject.inputIconAboveSize" :color="passedObject.inputIconAboveColor">{{ passedObject.inputIconAbove }}</v-icon></span></v-layout>
								</v-col>
							</v-row>
							<v-row v-if="passedObject.panelHoverText" justify="center" align="center">
								<v-tooltip bottom :style="`position: absolute; z-index:${LZIndex+1}`">
									<template v-slot:activator="{ on, attrs }">
										<v-row justify="center" align="center" style="height: 100%;" v-bind="attrs" v-on="on">
                                                                                        <v-slider v-model="passedObject.inputLastVal" thumb-label="always" @start="setPauseUpdate()" @end="setVarVal($event)" @change="setVarVal($event)" :max="passedObject.inputControlRange[1]" :min="passedObject.inputControlRange[0]" :step="passedObject.inputControlSteps" :label="passedObject.inputPrefixText" style="height: 10px; margin-top: 10px;" :color="passedObject.panelMMPrefixColor" :class="['btncmd-slider', `text-${passedObject.panelMMTextSize}`]" align="center" justify="center" >
                                                                                                <template v-slot:thumb-label="{ value }">
                                                                                                        {{ value }} {{ passedObject.inputSuffixText }}
                                                                                                </template>
                                                                                        </v-slider>
                                                                                </v-row>
                                                                        </template>
                                                                        <span >{{ passedObject.panelHoverText }}</span>
                                                                </v-tooltip>
                                                        </v-row>
                                                        <v-row v-else justify="center" align="center">
                                                                <v-slider v-model="passedObject.inputLastVal" thumb-label="always" @start="setPauseUpdate()" @end="setVarVal($event)" @change="setVarVal($event)" :max="passedObject.inputControlRange[1]" :min="passedObject.inputControlRange[0]" :step="passedObject.inputControlSteps" :label="passedObject.inputPrefixText" style="height: 10px; margin-top: 10px;" :color="passedObject.panelMMPrefixColor" :class="['btncmd-slider', `text-${passedObject.panelMMTextSize}`]" align="center" justify="center" >
                                                                        <template v-slot:thumb-label="{ value }">
                                                                                {{ value }} {{ passedObject.inputSuffixText }}
                                                                        </template>
                                                                </v-slider>
                                                        </v-row>
                                                </v-col>
                                        </v-row>
                                        <v-row v-if="isVerticalSlider" dense justify="center" align="center" style="height: 100%;">
                                                <v-col class="vertical-slider-wrapper pa-0 ma-0" cols="12">
                                                        <div v-if="passedObject.panelHoverText" class="text-center">
                                                                <v-tooltip bottom :style="`position: absolute; z-index:${LZIndex+1}`">
                                                                        <template v-slot:activator="{ on, attrs }">
                                                                                <div v-bind="attrs" v-on="on" class="vertical-slider-wrapper">
                                                                                        <span :class="`text-${passedObject.panelMMTextSize}`" :style="`color: ${passedObject.panelMMPrefixColor}`">{{ passedObject.inputPrefixText }}</span>
                                                                                        <v-slider vertical v-model="passedObject.inputLastVal" thumb-label="always" :class="['vertical-slider', 'mt-4', 'btncmd-slider', `text-${passedObject.panelMMTextSize}`]" @start="setPauseUpdate()" @end="setVarVal($event)" @change="setVarVal($event)" :max="passedObject.inputControlRange[1]" :min="passedObject.inputControlRange[0]" :step="passedObject.inputControlSteps" :color="passedObject.panelMMPrefixColor" >
                                                                                                <template v-slot:thumb-label="{ value }">
                                                                                                        {{ value }} {{ passedObject.inputSuffixText }}
                                                                                                </template>
                                                                                        </v-slider>
                                                                                </div>
                                                                        </template>
                                                                        <span>{{ passedObject.panelHoverText }}</span>
                                                                </v-tooltip>
                                                        </div>
                                                        <div v-else class="vertical-slider-wrapper">
                                                                <span :class="`text-${passedObject.panelMMTextSize}`" :style="`color: ${passedObject.panelMMPrefixColor}`">{{ passedObject.inputPrefixText }}</span>
                                                                <v-slider vertical v-model="passedObject.inputLastVal" thumb-label="always" :class="['vertical-slider', 'mt-4', 'btncmd-slider', `text-${passedObject.panelMMTextSize}`]" @start="setPauseUpdate()" @end="setVarVal($event)" @change="setVarVal($event)" :max="passedObject.inputControlRange[1]" :min="passedObject.inputControlRange[0]" :step="passedObject.inputControlSteps" :color="passedObject.panelMMPrefixColor" >
                                                                        <template v-slot:thumb-label="{ value }">
                                                                                {{ value }} {{ passedObject.inputSuffixText }}
                                                                        </template>
                                                                </v-slider>
                                                        </div>
                                                </v-col>
                                        </v-row>
					<v-row v-if="passedObject.inputDispType == 'selection'" dense justify="center" align="center">
						<v-col class="d-flex flex-column pa-0 ma-0" justify="center" align="center" cols="10">
							<v-row v-if="passedObject.panelHoverText" justify="center" align="center">
								<v-tooltip bottom :style="`position: absolute; z-index:${LZIndex+1}`">
									<template v-slot:activator="{ on, attrs }">
										<v-row justify="center" align="center" style="height: 100%;" v-bind="attrs" v-on="on">
											<v-select :items="tempInputControlVals" :value="matchedVarVal" @focus="setPauseUpdate()" :class="`text-${passedObject.panelMMTextSize}`" :label="passedObject.inputPrefixText" @change="setVarVal($event)"></v-select>
										</v-row>
									</template>
									<span >{{ passedObject.panelHoverText }}</span>
								</v-tooltip>
							</v-row>
							<v-row v-else justify="center" align="center">
								<v-select :items="tempInputControlVals" :value="matchedVarVal" @focus="setPauseUpdate()" :class="`text-${passedObject.panelMMTextSize}`" :label="passedObject.inputPrefixText" @change="setVarVal($event)"></v-select>
							</v-row>
						</v-col>
					</v-row>
					<v-row v-if="passedObject.inputType != 'boolean' && passedObject.inputDispType == 'input'" dense justify="center" align="center">
						<v-col class="d-flex flex-column pa-0 ma-0" justify="center" align="center" cols="10">
							<v-row dense v-if="passedObject.panelHoverText" justify="center" align="center" style="height: 100%; width: 100%">
								<v-tooltip bottom :style="`position: absolute; z-index:${LZIndex+1}`">
									<template v-slot:activator="{ on, attrs }">
										<v-row v-if="passedObject.inputRequireEnter" justify="center" align="center" style="height: 100%; width: 100%!important;" v-bind="attrs" v-on="on">
											<v-text-field v-if="bPauseUpdates" ref="txtRef1" flat solo dense hide-details :style="`color: ${passedObject.panelMMPrefixColor};`" :class="`text-${passedObject.panelMMTextSize}`" :type="passedObject.inputType" :clearable="passedObject.inputEnableClear" :prefix="passedObject.inputPrefixText" :suffix="passedObject.inputSuffixText" v-model="newValTemp" :value="newValTemp" background-color="#FFFFFF00" :elevation="1" @keyup.enter="clearTextInputFocus($event, newValTemp)"></v-text-field>
											<v-text-field v-else flat solo dense hide-details :style="`color: ${passedObject.panelMMPrefixColor};`" :class="`text-${passedObject.panelMMTextSize}`" :type="passedObject.inputType" :clearable="passedObject.inputEnableClear" :prefix="passedObject.inputPrefixText" :suffix="passedObject.inputSuffixText" v-model="matchedVarVal" :value="matchedVarVal" background-color="#FFFFFF00" :elevation="1" @focus="setPauseUpdateText" ></v-text-field>
										</v-row>
										<v-row v-else justify="center" align="center" style="height: 100%; width: 100%!important;" v-bind="attrs" v-on="on">
											<v-text-field v-if="bPauseUpdates" ref="txtRef1" flat solo dense hide-details :style="`color: ${passedObject.panelMMPrefixColor};`" :class="`text-${passedObject.panelMMTextSize}`" :type="passedObject.inputType" :clearable="passedObject.inputEnableClear" :prefix="passedObject.inputPrefixText" :suffix="passedObject.inputSuffixText" v-model="newValTemp" :value="newValTemp" background-color="#FFFFFF00" :elevation="1" @change="updateTextInput(newValTemp)"></v-text-field>
											<v-text-field v-else flat solo dense hide-details :style="`color: ${passedObject.panelMMPrefixColor};`" :class="`text-${passedObject.panelMMTextSize}`" :type="passedObject.inputType" :clearable="passedObject.inputEnableClear" :prefix="passedObject.inputPrefixText" :suffix="passedObject.inputSuffixText" v-model="matchedVarVal" :value="matchedVarVal" background-color="#FFFFFF00" :elevation="1" @focus="setPauseUpdateText" ></v-text-field>
										</v-row>
									</template>
									<span >{{ passedObject.panelHoverText }}</span>
								</v-tooltip>
							</v-row>
							<v-row dense v-else justify="center" align="center" style="height: 100%; width: 100%">
								<v-row v-if="passedObject.inputRequireEnter" justify="center" align="center" style="height: 100%; width: 100%!important;">
									<v-text-field v-if="bPauseUpdates" ref="txtRef1" flat solo dense hide-details :style="`color: ${passedObject.panelMMPrefixColor};`" :class="`text-${passedObject.panelMMTextSize}`" :type="passedObject.inputType" :clearable="passedObject.inputEnableClear" :prefix="passedObject.inputPrefixText" :suffix="passedObject.inputSuffixText" v-model="newValTemp" :value="newValTemp" background-color="#FFFFFF00" :elevation="1" @keyup.enter="clearTextInputFocus($event, newValTemp)"></v-text-field>
									<v-text-field v-else flat solo dense hide-details :style="`color: ${passedObject.panelMMPrefixColor};`" :class="`text-${passedObject.panelMMTextSize}`" :type="passedObject.inputType" :clearable="passedObject.inputEnableClear" :prefix="passedObject.inputPrefixText" :suffix="passedObject.inputSuffixText" v-model="matchedVarVal" :value="matchedVarVal" background-color="#FFFFFF00" :elevation="1" @focus="setPauseUpdateText"></v-text-field>
								</v-row>
								<v-row v-else justify="center" align="center" style="height: 100%; width: 100%!important;">
									<v-text-field v-if="bPauseUpdates" ref="txtRef1" flat solo dense hide-details :style="`color: ${passedObject.panelMMPrefixColor};`" :class="`text-${passedObject.panelMMTextSize}`" :type="passedObject.inputType" :clearable="passedObject.inputEnableClear" :prefix="passedObject.inputPrefixText" :suffix="passedObject.inputSuffixText" v-model="newValTemp" :value="newValTemp" background-color="#FFFFFF00" :elevation="1" @change="updateTextInput(newValTemp)"></v-text-field>
									<v-text-field v-else flat solo dense hide-details :style="`color: ${passedObject.panelMMPrefixColor};`" :class="`text-${passedObject.panelMMTextSize}`" :type="passedObject.inputType" :clearable="passedObject.inputEnableClear" :prefix="passedObject.inputPrefixText" :suffix="passedObject.inputSuffixText" v-model="matchedVarVal" :value="matchedVarVal" background-color="#FFFFFF00" :elevation="1" @focus="setPauseUpdateText"></v-text-field>
								</v-row>
							</v-row>
						</v-col>
					</v-row>
					<v-row v-if="passedObject.inputType == 'boolean'" dense justify="center" align="center">
						<v-col class="d-flex flex-column pa-0 ma-0" justify="center" align="center" cols="10">
							<v-row v-if="passedObject.inputIconAbove" justify="center" align="center" class="d-flex pa-0 ma-0 mb-n4">
								<v-col cols="12" justify="center">
									<v-layout column align-center><span justify="center"><v-icon :size="passedObject.inputIconAboveSize" :color="passedObject.inputIconAboveColor">{{ passedObject.inputIconAbove }}</v-icon></span></v-layout>
								</v-col>
							</v-row>
							<v-row v-if="passedObject.panelHoverText" justify="center" align="center" class="d-flex pa-0 ma-0">
								<v-tooltip bottom :style="`position: absolute; z-index:${LZIndex+1}`">
									<template v-slot:activator="{ on, attrs }">
										<v-row v-if="bHasPrefix && bHasSuffix" justify="center" align="center" style="height: 100%;" v-bind="attrs" v-on="on">
											<v-col cols="3" justify="right">
												<span v-bind="attrs" v-on="on" :style="'color: ' + passedObject.panelMMPrefixColor + ';'" :class="`text-${passedObject.panelMMTextSize}`">{{passedObject.inputPrefixText}}</span>
											</v-col>
											<v-col cols="4" justify="center">
												<v-layout column align-center><span justify="center"><v-switch :value="matchedVarVal" v-model="passedObject.inputLastVal" @change="setBoolVal($event)"></v-switch></span></v-layout>
											</v-col>
											<v-col cols="3" justify="left">
												<span :style="'color: ' + passedObject.panelMMPrefixColor + ';'" :class="`text-${passedObject.panelMMTextSize}`" :elevation="1" >{{passedObject.inputSuffixText}}</span>
											</v-col>
										</v-row>
										<v-row v-if="bHasPrefix && !bHasSuffix" justify="center" align="center" style="height: 100%;" v-bind="attrs" v-on="on">
											<v-col cols="5" justify="right">
												<span v-bind="attrs" v-on="on" :style="'color: ' + passedObject.panelMMPrefixColor + ';'" :class="`text-${passedObject.panelMMTextSize}`">{{passedObject.inputPrefixText}}</span>
											</v-col>
											<v-col cols="5" justify="left">
												<v-layout column align-center><span justify="center"><v-switch :value="matchedVarVal" v-model="passedObject.inputLastVal" @change="setBoolVal($event)"></v-switch></span></v-layout>
											</v-col>
										</v-row>
										<v-row v-if="!bHasPrefix && bHasSuffix" justify="center" align="center" style="height: 100%;" v-bind="attrs" v-on="on">
											<v-col cols="5" justify="right">
												<v-layout column align-center><span justify="center"><v-switch :value="matchedVarVal" v-model="passedObject.inputLastVal" @change="setBoolVal($event)"></v-switch></span></v-layout>
											</v-col>
											<v-col cols="5" justify="left">
												<span :style="'color: ' + passedObject.panelMMPrefixColor + ';'" :class="`text-${passedObject.panelMMTextSize}`" :elevation="1" >{{passedObject.inputSuffixText}}</span>
											</v-col>
										</v-row>
										<v-row v-if="!bHasPrefix && !bHasSuffix" justify="center" align="center" style="height: 100%;" v-bind="attrs" v-on="on">
											<v-switch justify="center" align="center" :value="matchedVarVal" v-model="passedObject.inputLastVal" @change="setBoolVal($event)"></v-switch>
										</v-row>
									</template>
									<span >{{ passedObject.panelHoverText }}</span>
								</v-tooltip>
							</v-row>
							<v-row v-else justify="center" align="center" class="d-flex pa-0 ma-0">
								<v-row v-if="bHasPrefix && bHasSuffix" justify="center" align="center" style="height: 100%;">
									<v-col cols="3" justify="right">
										<span v-bind="attrs" v-on="on" :style="'color: ' + passedObject.panelMMPrefixColor + ';'" :class="`text-${passedObject.panelMMTextSize}`">{{passedObject.inputPrefixText}}</span>
									</v-col>
									<v-col cols="4" justify="center">
										<v-layout column align-center><span justify="center"><v-switch :value="matchedVarVal" v-model="passedObject.inputLastVal" @change="setBoolVal($event)"></v-switch></span></v-layout>
									</v-col>
									<v-col cols="3" justify="left">
										<span :style="'color: ' + passedObject.panelMMPrefixColor + ';'" :class="`text-${passedObject.panelMMTextSize}`" :elevation="1" >{{passedObject.inputSuffixText}}</span>
									</v-col>
								</v-row>
								<v-row v-if="bHasPrefix && !bHasSuffix" justify="center" align="center" style="height: 100%;">
									<v-col cols="5" justify="right">
										<span v-bind="attrs" v-on="on" :style="'color: ' + passedObject.panelMMPrefixColor + ';'" :class="`text-${passedObject.panelMMTextSize}`">{{passedObject.inputPrefixText}}</span>
									</v-col>
									<v-col cols="5" justify="left">
										<v-layout column align-center><span justify="center"><v-switch :value="matchedVarVal" v-model="passedObject.inputLastVal" @change="setBoolVal($event)"></v-switch></span></v-layout>
									</v-col>
								</v-row>
								<v-row v-if="!bHasPrefix && bHasSuffix" justify="center" align="center" style="height: 100%;">
									<v-col cols="5" justify="right">
										<v-layout column align-center><span justify="center"><v-switch :value="matchedVarVal" v-model="passedObject.inputLastVal" @change="setBoolVal($event)"></v-switch></span></v-layout>
									</v-col>
									<v-col cols="5" justify="left">
										<span :style="'color: ' + passedObject.panelMMPrefixColor + ';'" :class="`text-${passedObject.panelMMTextSize}`" :elevation="1" >{{passedObject.inputSuffixText}}</span>
									</v-col>
								</v-row>
								<v-row v-if="!bHasPrefix && !bHasSuffix" justify="center" align="center" style="height: 100%;">
									<v-switch justify="center" align="center" :value="matchedVarVal" v-model="passedObject.inputLastVal" @change="setBoolVal($event)"></v-switch>
								</v-row>
							</v-row>
						</v-col>
					</v-row>
				</v-card-text>
			</v-row>
		</v-card>
	</div>		
</template>

<script>
'use strict'
import BtnCmdBtnActionFunctions from './BtnCmdBtnActionFunctions.js';
import BtnCmdDataFunctions from './BtnCmdDataFunctions.js';
import Path from "@/utils/path";
import store from "@/store";
import jsonpath from 'jsonpath';

export default {
	props: {
		passedObject: {
			type: Object
		},
		LZIndex: Number,
		finResize: Boolean
    },
	computed: {
		matchedVarVal() {return this.getModelValue();},
		currHSize() {return this.passedObject.panelHSize},
		currWSize() {return this.passedObject.panelWSize},
                currfinResize() {return this.passedObject.bPanelActivated},
                wInpType(){return this.passedObject.inputType},
                wInpDType(){return this.passedObject.inputDispType},
                darkTheme(){ return store.state.settings.darkTheme; },
                sliderTypes(){
                        return ['slider', 'slider-vertical'];
                },
                isSliderDisp(){
                        return this.sliderTypes.includes(this.passedObject.inputDispType);
                },
                isHorizontalSlider(){
                        return this.passedObject.inputType == 'number' && this.passedObject.inputDispType == 'slider';
                },
                isVerticalSlider(){
                        return this.passedObject.inputType == 'number' && this.passedObject.inputDispType == 'slider-vertical';
                },
                systemDirectory() {
                        return store.state.machine.model.directories.system;
                },
		bHasPrefix(){
			if(this.passedObject.inputPrefixText){
				let tempText = this.passedObject.inputPrefixText.replace(/ /g, "");
				if(tempText){
					return true;
				}else {
					return false;
				}
			}else {
				return false;
			}
		},
		bHasSuffix(){
			if(this.passedObject.inputSuffixText){
				let tempText = this.passedObject.inputSuffixText.replace(/ /g, "");
				if(tempText){
					return true;
				}else {
					return false;
				}
			}else{
				return false;
			}
		},
		overlayTextColor(){
			if(!this.darkTheme){
				return "text-field-style-black"
			}else{
				return "text-field-style-white"
			}
		},
		overlayBackgroundColor(){
			if(this.passedObject.panelColor){
				return this.passedObject.panelColor
			}else{
				if(!this.darkTheme){
					return "white"
				}else{
					return "black"
				}
			}
		}
	},
	mixins: [
		BtnCmdBtnActionFunctions,
		BtnCmdDataFunctions
	],
	data: function () {
            return {
				showItems: false,
				code: '',
				newValTemp: null,
				bPauseUpdates: false,
				tempInputControlVals: [],
				directory: Path.filaments
			}
	},
        methods: {
                getSliderDisplayValue(value){
                        const suffix = this.passedObject.inputSuffixText ? ` ${this.passedObject.inputSuffixText}` : '';
                        return `${value}${suffix}`;
                },
                getModelValue(){
                        const jp = jsonpath;
                        if(this.passedObject.inputVarName && !this.passedObject.inputLinkToOM){
				let tmpNum = null;
				let tmpArr = null;
				//detect if this is a global variable array and retrieve the array value - dwc 3.5
				tmpArr = this.passedObject.inputVarName.match(/(?<=\[)[0-9]+?(?=\])/g);
				if(tmpArr){
					tmpNum = Number(tmpArr[0]);
					let tmpStr = this.passedObject.inputVarName.replace(/\[.*\]/g, "");
					if(store.state.machine.model.global.has(tmpStr)){
						this.doRightALign();
						let globArr = store.state.machine.model.global.get(tmpStr);
						return globArr[tmpNum]
					}else{ 
						return "###";
					}
				} 
				if(store.state.machine.model.global.has(this.passedObject.inputVarName)){
					this.doRightALign();
					return store.state.machine.model.global.get(this.passedObject.inputVarName);
				}else{
					return "###";
				}
			}else if(this.passedObject.inputVarName && this.passedObject.inputLinkToOM){
				if(this.passedObject.inputVarName.startsWith("global.")){
					let tmpStr = this.passedObject.inputVarName.replace("global.", "");
					let tmpNum = null;
					let tmpArr = null;
					//detect if this is a global variable array and retrieve the array value - dwc 3.5
					tmpArr = tmpStr.match(/(?<=\[)[0-9]+?(?=\])/g);
					if(tmpArr){
						tmpNum = Number(tmpArr[0]);
						tmpStr = tmpStr.replace(/\[.*\]/g, "");
						if(store.state.machine.model.global.has(tmpStr)){
							let globArr = store.state.machine.model.global.get(tmpStr);
							return globArr[tmpNum]
						}else{
							return "###";
						}
					}
					if(store.state.machine.model.global.has(tmpStr)){
						return store.state.machine.model.global.get(tmpStr);
					}else{
						return "###";
					}
				}else if(this.passedObject.inputVarName.startsWith("plugins.")){
					return "plugins Object cannot be used here";
				}else{
					var matchInModel = jp.query(store.state.machine.model, (`$.${this.passedObject.inputVarName}`));
					if(JSON.stringify(matchInModel) != "[]"){
						return  matchInModel[0];
					}else{
						return "###";
					}
				}
			}else {
				return "###";
			}		
		},
		setPauseUpdate(){
			//console.log("Pausing")
			this.newValTemp = this.matchedVarVal;
			this.bPauseUpdates = true;
		},
		setPauseUpdateText(){
			//console.log("Pausing For Text")
			this.newValTemp = this.matchedVarVal;
			this.bPauseUpdates = true;
			setTimeout(() => {this.$refs.txtRef1.focus()},0);
		},
		unPauseUpdate(){
			//console.log("UnPausing")
			this.bPauseUpdates = false;
		},
		async setVarVal(newValue){
			//console.log("Run setvarval", newValue)
			var tmpParent = this;
			var tmpCmd = "";
			if(this.passedObject.inputVarName && !this.passedObject.inputLinkToOM){
				if(this.passedObject.inputType == "text" && this.passedObject.inputDispType == 'input'){
					//let tmpValue = newValue.target.value;
					let tmpValue = newValue;
					if(!tmpValue) {tmpValue="";}
					tmpCmd = `set global.${this.passedObject.inputVarName} = "${tmpValue}"`;
					tmpParent.code = tmpCmd;
					await tmpParent.send();
					
                                }else if(this.passedObject.inputType == "number" && this.isSliderDisp){
                                        tmpCmd = `set global.${this.passedObject.inputVarName} = ${Number(this.passedObject.inputLastVal)}`;
                                        tmpParent.code = tmpCmd;
                                        await tmpParent.send();
				}else if(this.passedObject.inputType == "text" && this.passedObject.inputDispType == 'selection'){
					if(newValue){
						tmpCmd = `set global.${this.passedObject.inputVarName} = "${newValue}"`;
						this.passedObject.inputLastVal = newValue;
						tmpParent.code = tmpCmd;
						await tmpParent.send();
					}
				}else{
					//let tmpValue = newValue.target.value;
					let tmpValue = newValue;
					if(!tmpValue){
						tmpParent.$makeNotification('error', 'Invalid Number Entered!', 'The value of the variable has not been changed');
						return;
					}else{
						tmpCmd = `set global.${this.passedObject.inputVarName} = ${Number(tmpValue)}`;
					}
					tmpParent.code = tmpCmd;
					await tmpParent.send();
					this.passedObject.inputLastVal = Number(tmpValue);
				}
			}
			if(this.passedObject.inputAfterChangeGCodeCMD){
				let tmpCmdStr = "";
				if(this.passedObject.inputType == "number"){
					tmpCmdStr = this.passedObject.inputAfterChangeGCodeCMD.replace("##VALUE##", Number(newValue));
				}else{
					tmpCmdStr = this.passedObject.inputAfterChangeGCodeCMD.replace("##VALUE##", newValue);
				}
				tmpParent.code = tmpCmdStr;
				await tmpParent.send();
			}
			//console.log("endsetvar")
			var tmpParent = null;
			this.newValTemp = null;
			this.unPauseUpdate();
		},
		clearTextInputFocus(event, newValue) {
			//console.log("newvalue", newValue)
			this.setVarVal(newValue);
			if (event.keyCode === 13) {
				event.preventDefault();
				event.target.blur();
			}
		},
		updateTextInput(newValue){
			this.setVarVal(newValue);
		},
		async setBoolVal(newValue){
			this.bPauseUpdates = true;
			var tmpParent = this;
			var tmpCmd = "";
			var tmpValue = newValue;
			if (newValue != true){tmpValue = false;}
			if(this.passedObject.inputVarName && !this.passedObject.inputLinkToOM){
				tmpCmd = `set global.${this.passedObject.inputVarName} = ${tmpValue}`;
				tmpParent.code = tmpCmd;
				await tmpParent.send();
				this.passedObject.inputLastVal = tmpValue;
			}
			if(this.passedObject.inputAfterChangeGCodeCMD){
				let tmpCmdStr = this.passedObject.inputAfterChangeGCodeCMD.replace("##VALUE##", tmpValue.toString());
				tmpParent.code = tmpCmdStr;
				await tmpParent.send();
			}
			this.bPauseUpdates = false;
		},
		doRightALign(){
			//dirty hack to align text inputs 
			if(this.passedObject.inputType != 'boolean' && this.passedObject.inputDispType == 'input'){
				const currCard = document.getElementById(`gip-${this.passedObject.panelID}`)
				if(currCard){
					const inputs = currCard.getElementsByTagName('input');
					//console.log("inputs: ", inputs)			
					for(var i = 0; i < inputs.length; i++) {
						try{
							if(inputs[i].type == "number") {
								inputs[i].style.textAlign = "right"
							}else if(inputs[i].type != "number"){
								inputs[i].style.textAlign = "center"
							}
						}catch{
							//do nothng
						}
					}
				}
			}
		},
		async doListValues(){
			if(this.passedObject.inputUseFileForList){
				const tmpList = await this.loadSelectListFromFile(this.passedObject.inputListFilePath);
				console.log("tmpList", tmpList);
				this.tempInputControlVals = tmpList.listValues;
			} else if(this.passedObject.inputListFromDB){
				console.log("directory", this.directory);
				const files = await store.dispatch("machine/getFileList", this.directory);
				console.log("files", files);
				if(files){
					for (var i = 0; i < files.length; i++) {
						this.tempInputControlVals.push(files[i].name);
					}
				}else{
					this.tempInputControlVals = [];
				}
			} else{
				console.log("gettin data from cookie");
				this.tempInputControlVals = this.passedObject.inputControlVals;			
			}
		}
		
	},
	mounted(){
		this.doRightALign();
		this.passedObject.inputLastVal = this.matchedVarVal;
		if(this.passedObject.inputDispType == 'selection') {this.doListValues();}
	},
	activated(){
		this.doRightALign();
	},
	updated(){
		this.doRightALign();
	},
	watch:{
		currfinResize(to){
			if(!to){
				this.doRightALign()
			}
		},
		matchedVarVal(to){
			if(!this.bPauseUpdates){
				this.passedObject.inputLastVal = to;
			}
		},
		wInpType(){
			this.doRightALign()
		},
		wInpDType(){
			this.doRightALign()
		}
	}
}
</script>
