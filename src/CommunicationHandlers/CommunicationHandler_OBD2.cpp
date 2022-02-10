#include "CommunicationHandlers/CommunicationHandler_OBD2.h"

using namespace EmbeddedIOServices;
using namespace OperationArchitecture;

#ifdef COMMUNICATIONHANDLER_OBD2_H
namespace EFIGenie
{	
		CommunicationHandler_OBD2::CommunicationHandler_OBD2(ICommunicationService *communicationService, SystemBus *systemBus, const OBD2VariableMap *variableMap) :
			_communicationService(communicationService),
			_systemBus(systemBus),
			_variableMap(variableMap)
		{
			_communicationReceiveCallBack = [this](void *data, size_t length) { return this->Receive(data, length); };
			_communicationService->RegisterReceiveCallBack(&_communicationReceiveCallBack);
		}

		CommunicationHandler_OBD2::~CommunicationHandler_OBD2()
		{
			_communicationService->UnRegisterReceiveCallBack(&_communicationReceiveCallBack);
		}

		/**
		 * @brief Parse up to length bytes of data and perform communication service
		 * response based on service code detected.
		 * 
		 * The form of the data will generally be service type followed by PID. The
		 * PID typically specifies physical sensor readings such as pressure or
		 * engine load. This function will interpret that data into the proper format
		 * for communication on the CAN bus.
		 * 
		 * @param data A pointer to length bytes. Service type is the first byte and PID is the second.
		 * @param length Number of bytes that the data pointer is pointing to.
		 * @return size_t Number of bytes parsed from data.
		 */
		size_t CommunicationHandler_OBD2::Receive(void *data, size_t length)
		{
			uint8_t service = *reinterpret_cast<uint8_t *>(data); //grab service from data
			data = reinterpret_cast<uint8_t *>(data) + 1; //ofset data

			switch(service)
			{
				// Service/Mode 01: Show Current Data
				case 1:
				{
					uint8_t pid = *reinterpret_cast<uint8_t *>(data); //grab pid from data
					data = reinterpret_cast<uint8_t *>(data) + 1; //offset data
					switch(pid)
					{
						// Calculated Engine Load
						case 4:
						{
							std::map<uint32_t, Variable*>::iterator it = _systemBus->Variables.find(_variableMap->CalculatedEngineLoadID);
							if(it != _systemBus->Variables.end())
							{
								// Engine load will be a float value between 0 and 1
								// Need to normalize to a byte value by multiplying by 255, then perform a type conversion.
								uint8_t cel = it->second->To<float>() * 255;
								_communicationService->Send(&cel, 1);
								return 2;
							}
						}
						// Engine Coolant Temp
						case 5:
						{
							std::map<uint32_t, Variable*>::iterator it = _systemBus->Variables.find(_variableMap->EngineCoolantTempID);
							if(it != _systemBus->Variables.end())
							{
 								//add 40 to align with -40 to 215 of obd2 pid. then convert to uint8_t
								uint8_t ect = it->second->To<int16_t>() + 40;
								_communicationService->Send(&ect, 1);
								return 2;
							}
						}
						// Fuel Trim
						case 6:
						case 7:
						case 8:
						case 9:
						{
							std::map<uint32_t, Variable*>::iterator it = _systemBus->Variables.find(_variableMap->FuelTrimID[pid - 6]);
							if(it != _systemBus->Variables.end())
							{
								// Min value is -100, max is 99.2. Need to normalize so it will fit in an unsigned byte.
								uint8_t ft = static_cast<int16_t>(it->second->To<float>() * 128) + 128;
								_communicationService->Send(&ft, 1);
								return 2;
							}
						}
						// Fuel Pressure
						case 10:
						{
							std::map<uint32_t, Variable*>::iterator it = _systemBus->Variables.find(_variableMap->FuelPressureID);
							if(it != _systemBus->Variables.end())
							{
								// Fuel pressure is given in Bar but needs to be returned in kPa. Additionally, the byte
								// will be multiplied by 3 by the receiver so must divide by 3 as well.
								uint8_t fp = it->second->To<float>() * 100 / 3;
								_communicationService->Send(&fp, 1);
								return 2;
							}
						}
						// Intake Manifold Absolute Pressure
						case 11:
						{
							std::map<uint32_t, Variable*>::iterator it = _systemBus->Variables.find(_variableMap->IntakeManifoldPressureID);
							if(it != _systemBus->Variables.end())
							{
								// Intake manifold pressure is given in Bar but needs to be returned in kPa.
								uint8_t imp = it->second->To<float>() * 100;
								_communicationService->Send(&imp, 1);
								return 2;
							}
						}
					}
				}
			}

			return 0;
		}
}
#endif