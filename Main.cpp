#include <stm32f10x_rcc.h>
#include <stm32f10x_flash.h>
#include <map>
#include <functional>
#include "HardwareAbstractionCollection.h"
#include "IDecoder.h"
#include "Stm32F103TimerService.h"
#include "Stm32F103DigitalService.h"
#include "Stm32F103AnalogService.h"
#include "Stm32F103PwmService.h"
#include "EmbeddedResources.h"
#include "stm32f10x_tim.h"
#include <stm32f10x_gpio.h>
#include "stm32f10x_exti.h"
#include "ServiceLocator.h"
#include "ServiceBuilder.h"

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

HardwareAbstraction::HardwareAbstractionCollection _hardwareAbstractionCollection;
IDecoder *_decoder;

int main()
{
	clock_init();
		
	_hardwareAbstractionCollection.TimerService = new Stm32::Stm32F103TimerService(4, 4, 100000);
		
	_hardwareAbstractionCollection.DigitalService = new Stm32::Stm32F103DigitalService();
	
	_hardwareAbstractionCollection.AnalogService = new Stm32::Stm32F103AnalogService();
	
	_hardwareAbstractionCollection.PwmService = new Stm32::Stm32F103PwmService();
		
	void *config = EmbeddedResources::ConfigFile_dat.data();
	unsigned int size;
	
	ServiceLocator *serviceLocator = ServiceBuilder::CreateServices(&_hardwareAbstractionCollection, config, &size);
	config = (void *)((unsigned char *)config + size);
		
	_decoder = (IDecoder*)serviceLocator->Locate(DECODER_SERVICE_ID);
	CallBackGroup *preSyncCallBackGroup = (CallBackGroup*)serviceLocator->Locate(PRE_DECODER_SYNC_CALL_BACK_GROUP);
	CallBackGroup *postSyncCallBackGroup = (CallBackGroup*)serviceLocator->Locate(POST_DECODER_SYNC_CALL_BACK_GROUP);
	CallBackGroup *tickSyncCallBackGroup = (CallBackGroup*)serviceLocator->Locate(TICK_CALL_BACK_GROUP);
	
	preSyncCallBackGroup->Execute();
	while(!_decoder->IsSynced());
	postSyncCallBackGroup->Execute();
	
	for (;;)
	{
		tickSyncCallBackGroup->Execute();
	}
}

void ConfigureInterrupts()
{
	GPIO_InitTypeDef GPIO_InitStruct;
	EXTI_InitTypeDef EXTI_InitStruct;
    
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
			
			_decoder->CrankEdgeTrigger(edgeTrigger);
			
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
			
			_decoder->CamEdgeTrigger(edgeTrigger);
			
			EXTI_ClearITPendingBit(EXTI_Line14);
		}
	}
}

