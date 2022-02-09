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
			_communicationHandler = [this](void *data, size_t length) { return this->Receive(data, length); };
			_communicationService->RegisterHandler(&_communicationHandler);
		}

		CommunicationHandler_OBD2::~CommunicationHandler_OBD2()
		{
			_communicationService->UnRegisterHandler(&_communicationHandler);
		}

		/**
		 * @brief Parse up to length bytes of data and perform communication service
		 * response based on service code detected. 
		 * 
		 * @param data A pointer to length bytes. The data is CAN packet data.
		 * @param length Number of bytes that the data pointer is pointing to.
		 * @return size_t How many bytes parsed. 
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
								uint8_t cel = (*it->second * 255).To<uint8_t>();
								_communicationService->Send(&cel, 1);
								return 2;
							}
						}
						// Engine Coolant Temp
						case 5:
						{
							std::map<uint32_t, Variable*>::iterator it = _systemBus->Variables.find(_variableMap->EngineCoolantTempID); //find the variable iterator
							if(it != _systemBus->Variables.end())
							{
								Variable ectVariable = *it->second; //pull variabled out of the iterator
								uint8_t ect = (ectVariable + 40).To<uint8_t>(); //add 40 to align with -40 to 215 of obd2 pid. then convert to uint8_t
								_communicationService->Send(&ect, 1); //send formatted ect variable back
								return 2; //return that we parsed 2 bytes from the data received
							}
						}
					}
				}
			}

			return 0;
		}
}
#endif