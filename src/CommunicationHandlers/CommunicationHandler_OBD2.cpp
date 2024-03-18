#include "CommunicationHandlers/CommunicationHandler_OBD2.h"

using namespace EmbeddedIOServices;
using namespace OperationArchitecture;

#ifdef COMMUNICATIONHANDLER_OBD2_H
namespace EFIGenie
{	
		CommunicationHandler_OBD2::CommunicationHandler_OBD2(GeneratorMap<Variable> *variableMap, const OBD2VariableMap *obd2VariableMap) :
			_variableMap(variableMap),
			_obd2VariableMap(obd2VariableMap)
		{
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
		size_t CommunicationHandler_OBD2::Receive(communication_send_callback_t sendCallBack, const void *data, size_t length)
		{
			uint8_t service = *reinterpret_cast<const uint8_t *>(data); //grab service from data
			data = reinterpret_cast<const uint8_t *>(data) + 1; //ofset data

			switch(service)
			{
				// Service/Mode 01: Show Current Data
				case 1:
				{
					uint8_t pid = *reinterpret_cast<const uint8_t *>(data); //grab pid from data
					data = reinterpret_cast<const uint8_t *>(data) + 1; //offset data
					switch(pid)
					{
						// Calculated Engine Load
						case 4:
						{
							GeneratorMap<Variable>::iterator it = _variableMap->find(_obd2VariableMap->CalculatedEngineLoadID);
							if(it != _variableMap->end())
							{
								// Engine load will be a float value between 0 and 1
								// Need to normalize to a byte value by multiplying by 255, then perform a type conversion.
								uint8_t cel = static_cast<float>(*it->second) * 255;
								sendCallBack(&cel, 1);
								return 2;
							}
						}
						// Engine Coolant Temp
						case 5:
						{
							GeneratorMap<Variable>::iterator it = _variableMap->find(_obd2VariableMap->EngineCoolantTempID);
							if(it != _variableMap->end())
							{
 								//add 40 to align with -40 to 215 of obd2 pid. then convert to uint8_t
								uint8_t ect = static_cast<int16_t>(*it->second) + 40;
								sendCallBack(&ect, 1);
								return 2;
							}
						}
						// Fuel Trim
						case 6:
						case 7:
						case 8:
						case 9:
						{
							GeneratorMap<Variable>::iterator it = _variableMap->find(_obd2VariableMap->FuelTrimID[pid - 6]);
							if(it != _variableMap->end())
							{
								// Min value is -100, max is 99.2. Need to normalize so it will fit in an unsigned byte.
								uint8_t ft = static_cast<int16_t>(static_cast<float>(*it->second) * 128) + 128;
								sendCallBack(&ft, 1);
								return 2;
							}
						}
						// Fuel Pressure
						case 10:
						{
							GeneratorMap<Variable>::iterator it = _variableMap->find(_obd2VariableMap->FuelPressureID);
							if(it != _variableMap->end())
							{
								// Fuel pressure is given in Bar but needs to be returned in kPa. Additionally, the byte
								// will be multiplied by 3 by the receiver so must divide by 3 as well.
								uint8_t fp = static_cast<float>(*it->second) * 100 / 3;
								sendCallBack(&fp, 1);
								return 2;
							}
						}
						// Intake Manifold Absolute Pressure
						case 11:
						{
							GeneratorMap<Variable>::iterator it = _variableMap->find(_obd2VariableMap->IntakeManifoldPressureID);
							if(it != _variableMap->end())
							{
								// Intake manifold pressure is given in Bar but needs to be returned in kPa.
								uint8_t imp = static_cast<float>(*it->second) * 100;
								sendCallBack(&imp, 1);
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