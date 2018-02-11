#include <stm32f10x_rcc.h>
#include <stm32f10x_flash.h>
#include <map>
#include <functional>
#include "PistonEngineFactory.h"
#include "Stm32F10xTimerService.h"
#include "Stm32F10xDigitalService.h"
#include "Stm32F10xAnalogService.h"
#include "EmbeddedResources.h"
#include "stm32f10x_tim.h"
#include <stm32f10x_gpio.h>
#include "stm32f10x_exti.h"

#define INJECTOR_PIN_1 0
#define INJECTOR_PIN_2 0
#define INJECTOR_PIN_3 0
#define INJECTOR_PIN_4 0
#define INJECTOR_PIN_5 0
#define INJECTOR_PIN_6 0
#define INJECTOR_PIN_7 0
#define INJECTOR_PIN_8 0

#define IGNITION_PIN_1 0
#define IGNITION_PIN_2 0
#define IGNITION_PIN_3 0
#define IGNITION_PIN_4 0
#define IGNITION_PIN_5 0
#define IGNITION_PIN_6 0
#define IGNITION_PIN_7 0
#define IGNITION_PIN_8 0

#define MAP_PIN 0
#define ECT_PIN 0
#define IAT_PIN 0
#define TPS_PIN 0
#define VOLTAGE_PIN 0
#define ETHANOL_PIN 0

void clock_init() {
  /*Configure all clocks to max for best performance.
   * If there are EMI, power, or noise problems, try slowing the clocks*/

  /* First set the flash latency to work with our clock*/
  /*000 Zero wait state, if 0  MHz < SYSCLK <= 24 MHz
    001 One wait state, if  24 MHz < SYSCLK <= 48 MHz
    010 Two wait states, if 48 MHz < SYSCLK <= 72 MHz */
	FLASH_SetLatency(FLASH_Latency_2);

	  /* Start with HSI clock (internal 8mhz), divide by 2 and multiply by 9 to
	   * get maximum allowed frequency: 36Mhz
	   * Enable PLL, wait till it's stable, then select it as system clock*/
	RCC_PLLConfig(RCC_PLLSource_HSE_Div1, RCC_PLLMul_9);
	RCC_PLLCmd(ENABLE);
	while (RCC_GetFlagStatus(RCC_FLAG_PLLRDY) == RESET) {}
	RCC_SYSCLKConfig(RCC_SYSCLKSource_PLLCLK);

	  /* Set HCLK, PCLK1, and PCLK2 to SCLK (these are default */
	RCC_HCLKConfig(RCC_SYSCLK_Div1);
	RCC_PCLK1Config(RCC_HCLK_Div1);
	RCC_PCLK2Config(RCC_HCLK_Div1);

	  /* Set ADC clk to 12MHz (14MHz max, 18MHz default)*/
	RCC_ADCCLKConfig(RCC_PCLK2_Div6);
	
	SystemCoreClockUpdate();
}

HardwareAbstraction::ITimerService *_timerService;
HardwareAbstraction::IDigitalService *_digitalService;
HardwareAbstraction::IAnalogService *_analogService;
HardwareAbstraction::IPwmService *_pwmService;

int main()
{
	clock_init();
		
	_timerService = new Stm32::Stm32F10xTimerService();
		
	_digitalService = new Stm32::Stm32F10xDigitalService();
	
	_analogService = new Stm32::Stm32F10xAnalogService();
	
	//TODO: Implement PWM service
	_pwmService = NULL;
	
	unsigned char ignitionPins[MAX_CYLINDERS];
	ignitionPins[0] = IGNITION_PIN_1;
	ignitionPins[1] = IGNITION_PIN_2;
	ignitionPins[2] = IGNITION_PIN_3;
	ignitionPins[3] = IGNITION_PIN_4;
	ignitionPins[4] = IGNITION_PIN_5;
	ignitionPins[5] = IGNITION_PIN_6;
	ignitionPins[6] = IGNITION_PIN_7;
	ignitionPins[7] = IGNITION_PIN_8;
	
	unsigned char injectorPins[MAX_CYLINDERS];
	injectorPins[0] = INJECTOR_PIN_1;
	injectorPins[1] = INJECTOR_PIN_2;
	injectorPins[2] = INJECTOR_PIN_3;
	injectorPins[3] = INJECTOR_PIN_4;
	injectorPins[4] = INJECTOR_PIN_5;
	injectorPins[5] = INJECTOR_PIN_6;
	injectorPins[6] = INJECTOR_PIN_7;
	injectorPins[7] = INJECTOR_PIN_8;
	
	EngineManagement::CreateServices(_timerService, _digitalService, _analogService, _pwmService, EmbeddedResources::PistonEngineConfigFile_dat.data(), ignitionPins, false, true, injectorPins, false, false, MAP_PIN, EmbeddedResources::MapConfigFile_dat.data(), ECT_PIN, EmbeddedResources::EctConfigFile_dat.data(), IAT_PIN, EmbeddedResources::IatConfigFile_dat.data(), TPS_PIN, EmbeddedResources::TpsConfigFile_dat.data(), VOLTAGE_PIN, EmbeddedResources::VoltageConfigFile_dat.data(), ETHANOL_PIN, EmbeddedResources::EthanolConfigFile_dat.data(), EmbeddedResources::FuelTrimConfigFile_dat.data(), EmbeddedResources::AfrConfigFile_dat.data(), EmbeddedResources::PistonEngineInjectionConfigFile_dat.data(), EmbeddedResources::PistonEngineIgnitionConfigFile_dat.data());
	
	for (;;)
	{
		EngineManagement::ScheduleEvents();
	}
}

void ConfigureInterrupts()
{
	/* Set variables used */
	GPIO_InitTypeDef GPIO_InitStruct;
	EXTI_InitTypeDef EXTI_InitStruct;
    
	/* Enable clock for GPIOB */
	RCC_APB2PeriphClockCmd(RCC_APB2Periph_GPIOC, ENABLE);
	
	
	GPIO_InitStruct.GPIO_Pin = GPIO_Pin_15 | GPIO_Pin_14;
	GPIO_InitStruct.GPIO_Mode = GPIO_Mode_IN_FLOATING;
	GPIO_InitStruct.GPIO_Speed = GPIO_Speed_50MHz;
	GPIO_Init(GPIOC, &GPIO_InitStruct);

	
	RCC_APB2PeriphClockCmd(RCC_APB2Periph_AFIO, ENABLE);
	GPIO_EXTILineConfig(GPIO_PortSourceGPIOB, GPIO_PinSource6);
	EXTI_InitStruct.EXTI_Line = EXTI_Line15 | EXTI_Line14;
	EXTI_InitStruct.EXTI_Mode = EXTI_Mode_Interrupt;
	EXTI_InitStruct.EXTI_Trigger = EXTI_Trigger_Rising_Falling;
	EXTI_InitStruct.EXTI_LineCmd = ENABLE;
	EXTI_Init(&EXTI_InitStruct);
}

extern "C" 
{
	void EXTI15_IRQHandler(void)
	{
		if (EXTI_GetITStatus(EXTI_Line15) != RESET) 
		{
			Decoder::EdgeTrigger edgeTrigger;
			
			if (GPIO_ReadInputDataBit(GPIOC, GPIO_Pin_15))
				edgeTrigger = Decoder::EdgeTrigger::Up;
			else
				edgeTrigger = Decoder::EdgeTrigger::Down;
			
			EngineManagement::CurrentDecoder->CrankEdgeTrigger(edgeTrigger);
			
			EXTI_ClearITPendingBit(EXTI_Line15);
		}
	}
	
	void EXTI14_IRQHandler(void)
	{
		if (EXTI_GetITStatus(EXTI_Line14) != RESET) 
		{
			Decoder::EdgeTrigger edgeTrigger;
			
			if (GPIO_ReadInputDataBit(GPIOC, GPIO_Pin_14))
				edgeTrigger = Decoder::EdgeTrigger::Up;
			else
				edgeTrigger = Decoder::EdgeTrigger::Down;
			
			EngineManagement::CurrentDecoder->CamEdgeTrigger(edgeTrigger);
			
			EXTI_ClearITPendingBit(EXTI_Line14);
		}
	}
}

