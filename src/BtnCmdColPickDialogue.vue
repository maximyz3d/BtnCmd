<style>
    .btnCmd-container {
        display: flex;
        justify-content: center;
    }
    .custom-label-color .v-label {
        color: red;
        opacity: 1;
    }
</style>
<template>
    <v-dialog v-model="show" persistent max-width="600">
        <v-card style="overflow-x: hidden;">
			<v-card-title>
				<v-toolbar dark dense>
                    <v-toolbar-title>Pick A Colour</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="validateData()">
                        Close
                    </v-btn>
                </v-toolbar>
			</v-card-title>
            <v-card-text>
                <!-- <v-row mt-0><v-col><span class="text-caption">v-model = {{ passedObject }}</span></v-col></v-row> -->
                <v-col>
                    <div class="btnCmd-container"><v-color-picker class="ma-2" dot-size="30" v-model="currColor"></v-color-picker></div>
                </v-col>
            </v-card-text>
        </v-card>
    </v-dialog>
</template>


<script>
    export default {
        props: {
            value: Boolean,
            passedObject: {
                type: Object
            },
            colField: String
        },
        computed: {
            show: {
                get () {
                    return this.value
                },
                set (value) {
                    this.$emit('input', value)
                }
            }
        },
        data: function () {
            return {
                currColor: ''
            }
        },
        methods: {
            async sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            },
            async validateData() {
                if(this.colField == "panelColor"){
                    this.passedObject.panelColor = this.currColor;
                }
                if(this.colField == "MMPrefixColor"){
                    this.passedObject.panelMMPrefixColor = this.currColor;
                }
                if(this.colField == "MMValueColor"){
                    this.passedObject.panelMMValueColor = this.currColor;
                }
                if(this.colField == "ChartLineColor"){
                    this.passedObject.OMColor = this.currColor;
                }
                if(this.colField == "inputIconAboveColor"){
                    this.passedObject.inputIconAboveColor = this.currColor;
                }
                if(this.colField == "panelDynamicBGBooleanZeroColor"){
                    this.passedObject.panelDynamicBGBooleanZeroColor = this.currColor;
                }
                if(this.colField == "panelDynamicBGBooleanOneColor"){
                    this.passedObject.panelDynamicBGBooleanOneColor = this.currColor;
                }
                if(this.colField == "panelDynamicBGMinColor"){
                    this.passedObject.panelDynamicBGMinColor = this.currColor;
                }
                if(this.colField == "panelDynamicBGMidColor"){
                    this.passedObject.panelDynamicBGMidColor = this.currColor;
                }
                if(this.colField == "panelDynamicBGMaxColor"){
                    this.passedObject.panelDynamicBGMaxColor = this.currColor;
                }
                this.$emit('exit', true);
                this.show = false;
                return;
            }
        },
        mounted() {
            if(this.colField == "panelColor"){
                this.currColor = this.passedObject.panelColor;
            }
            if(this.colField == "MMPrefixColor"){
                this.currColor = this.passedObject.panelMMPrefixColor;
            }
            if(this.colField == "MMValueColor"){
                this.currColor = this.passedObject.panelMMValueColor;
            }
            if(this.colField == "ChartLineColor"){
                this.currColor = this.passedObject.OMColor;
            }
            if(this.colField == "inputIconAboveColor"){
                this.currColor = this.passedObject.inputIconAboveColor;
            }
            if(this.colField == "panelDynamicBGBooleanZeroColor"){
                this.currColor = this.passedObject.panelDynamicBGBooleanZeroColor;
            }
            if(this.colField == "panelDynamicBGBooleanOneColor"){
                this.currColor = this.passedObject.panelDynamicBGBooleanOneColor;
            }
            if(this.colField == "panelDynamicBGMinColor"){
                this.currColor = this.passedObject.panelDynamicBGMinColor;
            }
            if(this.colField == "panelDynamicBGMidColor"){
                this.currColor = this.passedObject.panelDynamicBGMidColor;
            }
            if(this.colField == "panelDynamicBGMaxColor"){
                this.currColor = this.passedObject.panelDynamicBGMaxColor;
            }
        }
    }
</script>