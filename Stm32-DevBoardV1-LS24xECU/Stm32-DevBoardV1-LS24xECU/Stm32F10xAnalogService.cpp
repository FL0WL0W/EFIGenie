#include <stm32f10x_gpio.h>
#include <stm32f10x_rcc.h>
#include <stm32f10x_adc.h>
#include <stdint.h>
#include "IAnalogService.h"
#include "Stm32F10xAnalogService.h"

namespace Stm32
{
	Stm32F10xAnalogService::Stm32F10xAnalogService()
	{
	//set ADC back to defaults
		ADC_DeInit(ADC1);

			//divide clock by 6 -> 72/6 = 12mhz
			//since adc conversion takes 12.5 clock cycles then 12.5/12mhz = 1.05uS resultion
			//over 5 channels thats 5.25 uS resolution
			//over 10 hannels thats 10.5 uS resolution
			//because that is 12bit signal that is 11.52mbit/s which means minimum spi frequency is 12mhz 
			//but should go higher than that since there is an 8 bit command code whichs means 19.2mbit/s
			//give a little safety marging for setup times and such and lets pick a spi clock of 36mhz
		RCC_ADCCLKConfig(RCC_PCLK2_Div6);

			//enable the ADC clock
		RCC_APB2PeriphClockCmd(RCC_APB2Periph_ADC1, ENABLE);

			//declare the adc init struct
		ADC_InitTypeDef  ADC_InitStructure;
		//set mode of adc to independent and disable continuous mode since we want software to give the conversion
		ADC_InitStructure.ADC_Mode = ADC_Mode_Independent;
		ADC_InitStructure.ADC_ScanConvMode = DISABLE;
		ADC_InitStructure.ADC_ContinuousConvMode = DISABLE;
		//no external triggers
		ADC_InitStructure.ADC_ExternalTrigConv = ADC_ExternalTrigConv_None;
		//right align the adc bits
		ADC_InitStructure.ADC_DataAlign = ADC_DataAlign_Right;
		//just 1 channel
		ADC_InitStructure.ADC_NbrOfChannel = 1;

			//apply the adc settings and enable adc
		ADC_Init(ADC1, &ADC_InitStructure);
		ADC_Cmd(ADC1, ENABLE);

			//calibrate the ADC
		ADC_ResetCalibration(ADC1);
		while (ADC_GetResetCalibrationStatus(ADC1))
			;
		ADC_StartCalibration(ADC1);
		while (ADC_GetCalibrationStatus(ADC1))
			;
	}

	void Stm32F10xAnalogService::InitPin(uint8_t pin)
	{
		if (pin == 0)
			return;
		pin -= 1;
		
		GPIO_InitTypeDef GPIO_InitStruct;

	//we want to enable the selected pins
		switch (pin)
		{
		case 0:
		case 16:
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_0;
			break;
		case 1:
		case 17:
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_1;
			break;
		case 2:
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_2;
			break;
		case 3:
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_3;
			break;
		case 4:
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_4;
			break;
		case 5:
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_5;
			break;
		case 6:
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_6;
			break;
		case 7:
			GPIO_InitStruct.GPIO_Pin = GPIO_Pin_7;
			break;
		}

			//configure as analog in
		GPIO_InitStruct.GPIO_Mode = GPIO_Mode_AIN;
		//speed can be slow since the conversion takes longer than the gpio will
		GPIO_InitStruct.GPIO_Speed = GPIO_Speed_2MHz;

		if (pin < 8)
		{
			GPIO_Init(GPIOA, &GPIO_InitStruct);
		}
		else if (pin > 15 && pin < 18)
		{
			GPIO_Init(GPIOB, &GPIO_InitStruct);
		}
	}
	
	float Stm32F10xAnalogService::ReadPin(uint8_t pin)
	{
		if (pin == 0)
			return 0;
		pin -= 1;
		
		//set the channel to the pin we want to read
		ADC_RegularChannelConfig(ADC1, pin, 1, ADC_SampleTime_1Cycles5);
	
		//start the conversion
		ADC_SoftwareStartConvCmd(ADC1, ENABLE);
		//wait for conversion to finish
		while (ADC_GetFlagStatus(ADC1, ADC_FLAG_EOC) == RESET)
			;
		//return the value
		return ADC_GetConversionValue(ADC1) * 0.000244140625f;  //convert from 12 bit to 16 bit
	}
}